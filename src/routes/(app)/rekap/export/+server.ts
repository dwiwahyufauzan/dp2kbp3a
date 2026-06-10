import type { RequestHandler } from "./$types"
import { createAPI } from "$lib/server/api"
import ExcelJS from "exceljs"
import {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, WidthType, HeadingLevel, AlignmentType, ImageRun,
    ShadingType, convertInchesToTwip, TableLayoutType,
} from "docx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { env } from "$env/dynamic/private"

const BACKEND_BASE = env.BACKEND_URL || "http://localhost:3000"

interface DokEntry { filePath: string; tipeFile: string | null }
interface RekapRow {
    namaLengkap: string; namaBidang: string | null
    totalLaporan: number; totalPeserta: number; totalDisetujui: number
    totalMenunggu: number; totalDitolak: number; totalRevisi: number
}
interface DetailRow {
    idLaporan: string; tanggalKegiatan: string; namaLengkap: string
    namaBidang: string | null; namaKegiatan: string | null; lokasiDetail: string
    jumlahPeserta: number; deskripsiKegiatan: string | null
    statusVerifikasi: string; catatanVerifikator: string | null
    dokumentasi: DokEntry[]
}

function buildPeriodeTitle(periode: string): string {
    if (!periode) return ""
    if (periode.length === 10) return `Harian — ${new Date(periode).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
    if (periode.length === 7) {
        const [y, m] = periode.split("-")
        return `Bulanan — ${new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
    }
    return `Tahunan — ${periode}`
}

async function fetchImageAsBase64(filePath: string): Promise<{ data: string; mimeType: string } | null> {
    try {
        const res = await fetch(`${BACKEND_BASE}/uploads/${filePath}`, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) return null
        const arr = await res.arrayBuffer()
        const mime = res.headers.get("content-type") ?? "image/jpeg"
        return { data: Buffer.from(arr).toString("base64"), mimeType: mime }
    } catch { return null }
}

export const GET: RequestHandler = async ({ cookies, url }) => {
    const session = cookies.get("session") ?? ""
    const api = createAPI(`session=${session}`)
    if (!session) return new Response("Tidak terautentikasi", { status: 401 })

    const periode  = url.searchParams.get("periode")  ?? ""
    const idBidang = url.searchParams.get("idBidang") ?? ""
    const format   = url.searchParams.get("format") ?? "excel"

    const params = new URLSearchParams()
    if (periode)  params.set("periode",  periode)
    if (idBidang) params.set("idBidang", idBidang)
    const qs = params.size > 0 ? "?" + params.toString() : ""

    const [resRekap, resDetail] = await Promise.all([
        api.get(`/rekap${qs}`),
        api.get(`/rekap/export-detail${qs}`),
    ])
    if (!resRekap.ok || !resDetail.ok) return new Response("Gagal mengambil data", { status: 500 })

    const rekap: RekapRow[] = await resRekap.json()
    const detail: DetailRow[] = await resDetail.json()

    const periodeTitle = buildPeriodeTitle(periode)
    const titleText = periodeTitle ? `Rekapitulasi Kegiatan — ${periodeTitle}` : "Rekapitulasi Kegiatan Seluruh Periode"
    const generated = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

    // ── EXCEL ──────────────────────────────────────────────────────────────────
    if (format === "excel") {
        const wb = new ExcelJS.Workbook()
        wb.creator = "DP2KBP3A"

        const ws1 = wb.addWorksheet("Ringkasan")
        ws1.mergeCells("A1:H1")
        const c1 = ws1.getCell("A1")
        c1.value = titleText.toUpperCase()
        c1.font = { size: 13, bold: true, color: { argb: "FFFFFFFF" } }
        c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } }
        c1.alignment = { horizontal: "center", vertical: "middle" }
        ws1.getRow(1).height = 32
        ws1.addRow([])

        const hdr1 = ws1.addRow(["No", "Nama Petugas", "Bidang", "Total Laporan", "Total Peserta", "Disetujui", "Menunggu", "Ditolak/Revisi"])
        hdr1.eachCell(c => {
            c.font = { bold: true, color: { argb: "FFFFFFFF" } }
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3F3F46" } }
            c.alignment = { horizontal: "center", vertical: "middle" }
        })
        hdr1.height = 22
        rekap.forEach((r, i) => {
            const row = ws1.addRow([i + 1, r.namaLengkap, r.namaBidang ?? "-", r.totalLaporan, r.totalPeserta, r.totalDisetujui, r.totalMenunggu, Number(r.totalDitolak) + Number(r.totalRevisi)])
            row.eachCell((c, col) => {
                c.alignment = { vertical: "middle", horizontal: col <= 2 ? "left" : "center" }
                if (i % 2 === 0) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } }
            })
        })
        const tot = ws1.addRow(["", "TOTAL", "", rekap.reduce((s, r) => s + Number(r.totalLaporan), 0), rekap.reduce((s, r) => s + Number(r.totalPeserta), 0), rekap.reduce((s, r) => s + Number(r.totalDisetujui), 0), rekap.reduce((s, r) => s + Number(r.totalMenunggu), 0), rekap.reduce((s, r) => s + Number(r.totalDitolak) + Number(r.totalRevisi), 0)])
        tot.eachCell(c => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } } })
        ws1.addRow([])
        ws1.addRow([`Dicetak: ${generated}`]).getCell(1).font = { italic: true, color: { argb: "FF71717A" } }
        ;[5, 32, 28, 15, 15, 13, 13, 17].forEach((w, i) => (ws1.getColumn(i + 1).width = w))

        const ws2 = wb.addWorksheet("Detail Laporan")
        ws2.mergeCells("A1:J1")
        const c2 = ws2.getCell("A1")
        c2.value = "DETAIL LAPORAN KEGIATAN — " + (periodeTitle || "SEMUA PERIODE")
        c2.font = { size: 13, bold: true, color: { argb: "FFFFFFFF" } }
        c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } }
        c2.alignment = { horizontal: "center", vertical: "middle" }
        ws2.getRow(1).height = 32
        ws2.addRow([])

        const hdr2 = ws2.addRow(["No", "Tanggal", "Nama Petugas", "Bidang", "Jenis Kegiatan", "Lokasi Detail", "Peserta", "Status", "Deskripsi", "Dokumentasi"])
        hdr2.eachCell(c => {
            c.font = { bold: true, color: { argb: "FFFFFFFF" } }
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3F3F46" } }
            c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
        })
        hdr2.height = 22
        detail.forEach((r, i) => {
            const tgl = new Date(r.tanggalKegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            const dok = r.dokumentasi.length > 0 ? `${r.dokumentasi.length} file: ${r.dokumentasi.map(d => d.filePath).join(", ")}` : "Tidak ada"
            const row = ws2.addRow([i + 1, tgl, r.namaLengkap, r.namaBidang ?? "-", r.namaKegiatan ?? "-", r.lokasiDetail, r.jumlahPeserta, r.statusVerifikasi, r.deskripsiKegiatan ?? "-", dok])
            row.eachCell((c, col) => {
                c.alignment = { vertical: "top", horizontal: col === 7 ? "center" : "left", wrapText: true }
                if (i % 2 === 0) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } }
            })
            row.height = r.deskripsiKegiatan && r.deskripsiKegiatan.length > 100 ? 60 : 40
        })
        ;[5, 22, 28, 22, 22, 30, 10, 14, 42, 36].forEach((w, i) => (ws2.getColumn(i + 1).width = w))

        const buffer = await wb.xlsx.writeBuffer()
        return new Response(buffer as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Rekap_${periode || "All"}.xlsx"`,
            }
        })
    }

    // ── PDF ────────────────────────────────────────────────────────────────────
    if (format === "pdf") {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

        doc.setFillColor(24, 24, 27); doc.rect(0, 0, 210, 36, "F")
        doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255)
        doc.text("DP2KBP3A — REKAPITULASI KEGIATAN", 14, 17)
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(161, 161, 170)
        doc.text(periodeTitle ? periodeTitle.toUpperCase() : "SEMUA PERIODE", 14, 26)
        doc.text(`Dicetak: ${generated}`, 196, 26, { align: "right" })
        doc.setTextColor(0, 0, 0)

        doc.setFont("helvetica", "bold"); doc.setFontSize(11)
        doc.text("Ringkasan Per Petugas", 14, 46)

        autoTable(doc, {
            startY: 50,
            head: [["No", "Nama Petugas", "Bidang", "Total", "Peserta", "Disetujui", "Pending"]],
            body: rekap.map((r, i) => [i + 1, r.namaLengkap, r.namaBidang ?? "-", r.totalLaporan, Number(r.totalPeserta).toLocaleString("id-ID"), r.totalDisetujui, r.totalMenunggu]),
            theme: "grid",
            headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold" },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            styles: { fontSize: 8, cellPadding: 2.5 },
            columnStyles: { 0: { halign: "center", cellWidth: 8 }, 3: { halign: "center", cellWidth: 14 }, 4: { halign: "center", cellWidth: 18 }, 5: { halign: "center", cellWidth: 18 }, 6: { halign: "center", cellWidth: 16 } }
        })

        if (detail.length > 0) {
            doc.addPage()
            doc.setFillColor(63, 63, 70); doc.rect(0, 0, 210, 24, "F")
            doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255)
            doc.text("DETAIL LAPORAN KEGIATAN", 14, 15)
            doc.setTextColor(0, 0, 0)

            autoTable(doc, {
                startY: 32,
                head: [["No", "Tanggal", "Petugas", "Jenis Kegiatan", "Lokasi", "Peserta", "Status"]],
                body: detail.map((r, i) => [i + 1, new Date(r.tanggalKegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }), r.namaLengkap, r.namaKegiatan ?? "-", r.lokasiDetail, r.jumlahPeserta, r.statusVerifikasi]),
                theme: "grid",
                headStyles: { fillColor: [63, 63, 70], textColor: [255, 255, 255], fontStyle: "bold" },
                alternateRowStyles: { fillColor: [249, 250, 251] },
                styles: { fontSize: 7.5, cellPadding: 2 },
                columnStyles: { 0: { halign: "center", cellWidth: 8 }, 1: { cellWidth: 24 }, 5: { halign: "center", cellWidth: 14 }, 6: { halign: "center", cellWidth: 18 } }
            })

            const withDok = detail.filter(d => d.dokumentasi.some(dk => /\.(jpg|jpeg|png|webp)$/i.test(dk.filePath)))
            if (withDok.length > 0) {
                doc.addPage()
                doc.setFillColor(24, 24, 27); doc.rect(0, 0, 210, 24, "F")
                doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255)
                doc.text("DOKUMENTASI FOTO", 14, 15)
                doc.setTextColor(0, 0, 0)

                let curY = 32
                for (const row of withDok) {
                    if (curY > 240) { doc.addPage(); curY = 14 }
                    doc.setFillColor(249, 250, 251); doc.rect(14, curY, 182, 20, "F")
                    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(24, 24, 27)
                    doc.text(`${row.namaLengkap} — ${row.namaKegiatan ?? "-"}`, 17, curY + 7)
                    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(113, 113, 122)
                    const tgl = new Date(row.tanggalKegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                    doc.text(`${tgl}  |  ${row.lokasiDetail}  |  ${row.jumlahPeserta} peserta  |  ${row.statusVerifikasi}`, 17, curY + 15)
                    curY += 24

                    const imgW = 55, imgH = 42, gap = 7, ml = 14
                    let imgX = ml, rowMaxY = curY
                    for (const dok of row.dokumentasi) {
                        if (!/\.(jpg|jpeg|png|webp)$/i.test(dok.filePath)) continue
                        if (curY > 240) { doc.addPage(); curY = 14; imgX = ml; rowMaxY = curY }
                        if (imgX + imgW > 196) { curY = rowMaxY + imgH + 4; imgX = ml; if (curY > 240) { doc.addPage(); curY = 14 }; rowMaxY = curY }
                        const img = await fetchImageAsBase64(dok.filePath)
                        if (img) {
                            try {
                                doc.addImage(`data:${img.mimeType};base64,${img.data}`, img.mimeType.includes("png") ? "PNG" : "JPEG", imgX, curY, imgW, imgH)
                                doc.setDrawColor(228, 228, 231); doc.rect(imgX, curY, imgW, imgH, "S")
                            } catch { /* skip */ }
                            imgX += imgW + gap
                            rowMaxY = Math.max(rowMaxY, curY)
                        }
                    }
                    curY = rowMaxY + imgH + 10
                }
            }
        }

        const totalPages = doc.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(161, 161, 170)
            doc.text(`DP2KBP3A  |  Halaman ${i} dari ${totalPages}`, 105, 292, { align: "center" })
        }

        const buffer = doc.output("arraybuffer")
        return new Response(buffer as unknown as BodyInit, {
            headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Rekap_${periode || "All"}.pdf"` }
        })
    }

    // ── WORD ───────────────────────────────────────────────────────────────────
    if (format === "word") {
        const ZINC = "18181B", ZINC_500 = "71717A"

        const hc = (text: string) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.SOLID, fill: ZINC } })
        const dc = (text: string, center = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 18 })], alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT })] })

        const summaryRows = [
            new TableRow({ children: ["No", "Nama Petugas", "Bidang", "Total", "Peserta", "Disetujui", "Pending"].map(hc) }),
            ...rekap.map((r, i) => new TableRow({ children: [dc((i + 1).toString(), true), dc(r.namaLengkap), dc(r.namaBidang ?? "-"), dc(r.totalLaporan.toString(), true), dc(Number(r.totalPeserta).toLocaleString("id-ID"), true), dc(r.totalDisetujui.toString(), true), dc(r.totalMenunggu.toString(), true)] }))
        ]

        const detailChildren: (Paragraph | Table)[] = [
            new Paragraph({ children: [new TextRun({ text: "DETAIL LAPORAN KEGIATAN", bold: true, size: 26, color: ZINC })], heading: HeadingLevel.HEADING_2, spacing: { before: 480, after: 240 } })
        ]

        for (const row of detail) {
            const tgl = new Date(row.tanggalKegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            detailChildren.push(
                new Paragraph({ children: [new TextRun({ text: `${row.namaLengkap} — ${row.namaKegiatan ?? "-"}`, bold: true, size: 22, color: ZINC })], spacing: { before: 320, after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: `${tgl}  |  ${row.lokasiDetail}  |  ${row.jumlahPeserta} Peserta  |  Status: ${row.statusVerifikasi}`, size: 18, color: ZINC_500 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: `Bidang: ${row.namaBidang ?? "-"}`, size: 18, color: ZINC_500 })], spacing: { after: 120 } }),
            )
            if (row.deskripsiKegiatan) {
                detailChildren.push(
                    new Paragraph({ children: [new TextRun({ text: "Deskripsi:", bold: true, size: 18 })], spacing: { after: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: row.deskripsiKegiatan, size: 18 })], spacing: { after: 120 }, indent: { left: convertInchesToTwip(0.2) } }),
                )
            }
            if (row.catatanVerifikator) {
                detailChildren.push(new Paragraph({ children: [new TextRun({ text: `Catatan Verifikator: ${row.catatanVerifikator}`, size: 17, italics: true, color: ZINC_500 })], spacing: { after: 120 } }))
            }
            if (row.dokumentasi.length > 0) {
                detailChildren.push(new Paragraph({ children: [new TextRun({ text: "Dokumentasi Foto:", bold: true, size: 18 })], spacing: { after: 80 } }))
                for (const dok of row.dokumentasi) {
                    if (!/\.(jpg|jpeg|png|webp)$/i.test(dok.filePath)) continue
                    const img = await fetchImageAsBase64(dok.filePath)
                    if (img) {
                        try {
                            detailChildren.push(new Paragraph({
                                children: [new ImageRun({ data: Buffer.from(img.data, "base64"), transformation: { width: 360, height: 270 }, type: img.mimeType.includes("png") ? "png" : "jpg" as "png" | "jpg" })],
                                spacing: { after: 120 },
                            }))
                        } catch { /* skip */ }
                    }
                }
            }
            detailChildren.push(new Paragraph({ children: [new TextRun({ text: " ", size: 10 })], spacing: { after: 80 }, border: { bottom: { style: "single", color: "E4E4E7", size: 1 } } }))
        }

        const wordDoc = new Document({
            styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: "REKAPITULASI KEGIATAN", bold: true, size: 32, color: ZINC })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
                    new Paragraph({ children: [new TextRun({ text: periodeTitle || "Seluruh Periode", size: 20, color: ZINC_500 })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
                    new Paragraph({ children: [new TextRun({ text: `Dicetak: ${generated}  |  DP2KBP3A`, size: 17, color: ZINC_500, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                    new Paragraph({ children: [new TextRun({ text: "RINGKASAN PER PETUGAS", bold: true, size: 24, color: ZINC })], spacing: { before: 200, after: 200 } }),
                    new Table({ rows: summaryRows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED }),
                    ...detailChildren,
                ]
            }]
        })

        const buffer = await Packer.toBuffer(wordDoc)
        return new Response(buffer as unknown as BodyInit, {
            headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="Rekap_${periode || "All"}.docx"` }
        })
    }

    return new Response("Format tidak didukung", { status: 400 })
}