import type { RequestHandler } from "./$types"
import { createAPI } from "$lib/server/api"
import {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, WidthType, HeadingLevel, AlignmentType, ImageRun,
    ShadingType, convertInchesToTwip, TableLayoutType, BorderStyle,
} from "docx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { env } from "$env/dynamic/private"

const BACKEND_BASE = env.BACKEND_URL || "http://localhost:3000"

interface DokEntry { filePath: string; tipeFile: string | null; namaAsli: string | null }
interface LaporanDetail {
    idLaporan: string; tanggalKegiatan: string; namaLengkap: string;
    namaBidang: string | null; namaKegiatan: string | null; lokasiDetail: string;
    jumlahPeserta: number; jumlahLaki: number | null; jumlahPerempuan: number | null;
    deskripsiKegiatan: string | null; statusVerifikasi: string; catatanVerifikator: string | null;
    namaKecamatan: string | null; namaDesa: string | null;
    dokumentasi: DokEntry[]
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

export const GET: RequestHandler = async ({ cookies, params, url }) => {
    const session = cookies.get("session") ?? ""
    const api = createAPI(`session=${session}`)
    if (!session) return new Response("Tidak terautentikasi", { status: 401 })

    const format = url.searchParams.get("format") ?? "pdf"

    const res = await api.get(`/laporan/${params.id}`)
    if (!res.ok) return new Response("Gagal mengambil data laporan", { status: 500 })

    const data: LaporanDetail = await res.json()
    const generated = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    const tglKegiatan = new Date(data.tanggalKegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

    // ── EXCEL (NOT SUPPORTED FOR SINGLE BUT JUST IN CASE) ────────────────────────
    if (format === "excel") {
        return new Response("Format Excel tidak didukung untuk laporan detail tunggal", { status: 400 })
    }

    // ── PDF ────────────────────────────────────────────────────────────────────
    if (format === "pdf") {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

        // Kop Instansi
        doc.setFillColor(24, 24, 27) // Zinc 900
        doc.rect(0, 0, 210, 36, "F")
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255)
        doc.text("DP2KBP3A", 14, 15)
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(161, 161, 170)
        doc.text("DINAS PENGENDALIAN PENDUDUK, KELUARGA BERENCANA,", 14, 22)
        doc.text("PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK", 14, 26)
        doc.setFontSize(8); doc.setTextColor(255, 255, 255)
        doc.text("LAPORAN DETAIL KEGIATAN", 196, 26, { align: "right" })

        // Title
        doc.setTextColor(24, 24, 27)
        doc.setFont("helvetica", "bold"); doc.setFontSize(12)
        doc.text("LAPORAN HASIL PELAKSANAAN KEGIATAN", 14, 48)
        doc.setDrawColor(228, 228, 231); doc.line(14, 50, 196, 50)

        // Metadata Table
        const metadata = [
            ["Nama Kegiatan", data.namaKegiatan ?? "-"],
            ["Bidang Kerja", data.namaBidang ?? "-"],
            ["Petugas Pelapor", data.namaLengkap],
            ["Tanggal Kegiatan", tglKegiatan],
            ["Kecamatan / Desa", `${data.namaKecamatan ?? "-"} / ${data.namaDesa ?? "-"}`],
            ["Lokasi Detail", data.lokasiDetail],
            ["Status Verifikasi", data.statusVerifikasi],
        ]

        autoTable(doc, {
            startY: 54,
            body: metadata,
            theme: "plain",
            styles: { fontSize: 9.5, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 }, 1: { cellWidth: 140 } }
        })

        // Statistik Peserta
        let currentY = (doc as any).lastAutoTable.finalY + 8
        doc.setFont("helvetica", "bold"); doc.setFontSize(11)
        doc.text("Statistik Peserta", 14, currentY)
        doc.line(14, currentY + 1.5, 196, currentY + 1.5)

        const stats = [
            ["Total Peserta", `${data.jumlahPeserta} Orang`],
            ["Peserta Laki-laki", data.jumlahLaki !== null ? `${data.jumlahLaki} Orang` : "-"],
            ["Peserta Perempuan", data.jumlahPerempuan !== null ? `${data.jumlahPerempuan} Orang` : "-"]
        ]

        autoTable(doc, {
            startY: currentY + 3,
            body: stats,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 }, 1: { cellWidth: 130 } }
        })

        // Deskripsi Kegiatan
        currentY = (doc as any).lastAutoTable.finalY + 8
        doc.setFont("helvetica", "bold"); doc.setFontSize(11)
        doc.text("Uraian / Deskripsi Kegiatan", 14, currentY)
        doc.line(14, currentY + 1.5, 196, currentY + 1.5)

        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5)
        const descText = data.deskripsiKegiatan ?? "Tidak ada deskripsi kegiatan."
        const splitDesc = doc.splitTextToSize(descText, 182)
        doc.text(splitDesc, 14, currentY + 6)
        
        // Calculate Y after description text
        const textHeight = (splitDesc.length * 5) // roughly 5mm per line spacing
        currentY = currentY + 8 + textHeight

        // Catatan Verifikator
        if (data.catatanVerifikator) {
            if (currentY > 250) { doc.addPage(); currentY = 20 }
            doc.setFillColor(249, 250, 251); doc.rect(14, currentY, 182, 18, "F")
            doc.setDrawColor(245, 158, 11) // Amber 500 border-left style
            doc.line(14, currentY, 14, currentY + 18)
            doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(180, 83, 9)
            doc.text("Catatan Verifikator:", 18, currentY + 5.5)
            doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(75, 85, 99)
            const splitCatatan = doc.splitTextToSize(data.catatanVerifikator, 172)
            doc.text(splitCatatan, 18, currentY + 11)
            currentY += 22
        }

        // Dokumentasi
        const images = data.dokumentasi.filter(d => d.filePath && /\.(jpg|jpeg|png|webp)$/i.test(d.filePath))
        if (images.length > 0) {
            if (currentY > 210) { doc.addPage(); currentY = 20 }
            doc.setTextColor(24, 24, 27)
            doc.setFont("helvetica", "bold"); doc.setFontSize(11)
            doc.text("Dokumentasi Foto Kegiatan", 14, currentY)
            doc.line(14, currentY + 1.5, 196, currentY + 1.5)
            currentY += 6

            const imgW = 85, imgH = 64, gap = 8, ml = 14
            let imgX = ml
            for (const img of images) {
                if (currentY > 210) { doc.addPage(); currentY = 20; imgX = ml }
                const imgData = await fetchImageAsBase64(img.filePath)
                if (imgData) {
                    try {
                        doc.addImage(`data:${imgData.mimeType};base64,${imgData.data}`, imgData.mimeType.includes("png") ? "PNG" : "JPEG", imgX, currentY, imgW, imgH)
                        doc.setDrawColor(228, 228, 231); doc.rect(imgX, currentY, imgW, imgH, "S")
                    } catch { /* skip */ }
                    imgX += imgW + gap
                    if (imgX + imgW > 196) {
                        imgX = ml
                        currentY += imgH + gap
                    }
                }
            }
        }

        // Footer info (Halaman)
        const totalPages = doc.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(161, 161, 170)
            doc.text(`Dicetak pada: ${generated}  |  DP2KBP3A  |  Halaman ${i} dari ${totalPages}`, 105, 290, { align: "center" })
        }

        const buffer = doc.output("arraybuffer")
        return new Response(buffer as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Laporan_${data.idLaporan.substring(0, 8)}.pdf"`,
            }
        })
    }

    // ── WORD ───────────────────────────────────────────────────────────────────
    if (format === "word") {
        const ZINC = "18181B", ZINC_500 = "71717A"

        const tableHeaderCell = (text: string) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 19 })], alignment: AlignmentType.CENTER })],
            shading: { type: ShadingType.SOLID, fill: ZINC },
            width: { size: 30, type: WidthType.PERCENTAGE }
        })

        const tableBodyCell = (text: string, bold = false) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold, size: 19 })] })],
            width: { size: 70, type: WidthType.PERCENTAGE }
        })

        const buildRow = (label: string, value: string) => new TableRow({
            children: [tableHeaderCell(label), tableBodyCell(value)]
        })

        const metadataRows = [
            buildRow("Nama Kegiatan", data.namaKegiatan ?? "-"),
            buildRow("Bidang Kerja", data.namaBidang ?? "-"),
            buildRow("Petugas Pelapor", data.namaLengkap),
            buildRow("Tanggal Pelaksanaan", tglKegiatan),
            buildRow("Kecamatan / Desa", `${data.namaKecamatan ?? "-"} / ${data.namaDesa ?? "-"}`),
            buildRow("Lokasi Detail", data.lokasiDetail),
            buildRow("Status Verifikasi", data.statusVerifikasi)
        ]

        const docChildren: (Paragraph | Table)[] = [
            new Paragraph({
                children: [new TextRun({ text: "LAPORAN HASIL KEGIATAN", bold: true, size: 28, color: ZINC })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 }
            }),
            new Paragraph({
                children: [new TextRun({ text: "DP2KBP3A", bold: true, size: 20, color: ZINC_500 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 360 }
            }),
            new Paragraph({
                children: [new TextRun({ text: "RINGKASAN KEGIATAN", bold: true, size: 22, color: ZINC })],
                spacing: { before: 200, after: 150 }
            }),
            new Table({
                rows: metadataRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                layout: TableLayoutType.FIXED
            }),
            new Paragraph({
                children: [new TextRun({ text: "STATISTIK PESERTA", bold: true, size: 22, color: ZINC })],
                spacing: { before: 300, after: 150 }
            }),
            new Table({
                rows: [
                    new TableRow({ children: [tableHeaderCell("Kategori"), tableHeaderCell("Jumlah")] }),
                    new TableRow({ children: [tableBodyCell("Total Peserta", true), tableBodyCell(`${data.jumlahPeserta} Orang`)] }),
                    new TableRow({ children: [tableBodyCell("Peserta Laki-laki"), tableBodyCell(data.jumlahLaki !== null ? `${data.jumlahLaki} Orang` : "-")] }),
                    new TableRow({ children: [tableBodyCell("Peserta Perempuan"), tableBodyCell(data.jumlahPerempuan !== null ? `${data.jumlahPerempuan} Orang` : "-")] })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                layout: TableLayoutType.FIXED
            }),
            new Paragraph({
                children: [new TextRun({ text: "URAIAN / DESKRIPSI KEGIATAN", bold: true, size: 22, color: ZINC })],
                spacing: { before: 300, after: 150 }
            }),
            new Paragraph({
                children: [new TextRun({ text: data.deskripsiKegiatan ?? "Tidak ada deskripsi.", size: 20 })],
                spacing: { after: 300 },
                indent: { left: convertInchesToTwip(0.1) }
            })
        ]

        if (data.catatanVerifikator) {
            docChildren.push(
                new Paragraph({
                    children: [new TextRun({ text: "CATATAN VERIFIKATOR", bold: true, size: 20, color: "B45309" })],
                    spacing: { before: 200, after: 100 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: data.catatanVerifikator, size: 18, italics: true, color: "4B5563" })],
                    spacing: { after: 300 },
                    indent: { left: convertInchesToTwip(0.15) }
                })
            )
        }

        const images = data.dokumentasi.filter(d => d.filePath && /\.(jpg|jpeg|png|webp)$/i.test(d.filePath))
        if (images.length > 0) {
            docChildren.push(
                new Paragraph({
                    children: [new TextRun({ text: "DOKUMENTASI FOTO KEGIATAN", bold: true, size: 22, color: ZINC })],
                    spacing: { before: 300, after: 200 }
                })
            )

            for (const img of images) {
                const imgData = await fetchImageAsBase64(img.filePath)
                if (imgData) {
                    try {
                        docChildren.push(
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: Buffer.from(imgData.data, "base64"),
                                        transformation: { width: 420, height: 315 },
                                        type: imgData.mimeType.includes("png") ? "png" : "jpg" as "png" | "jpg"
                                    })
                                ],
                                spacing: { after: 180 },
                                alignment: AlignmentType.CENTER
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: img.namaAsli ?? "Foto Kegiatan", size: 16, italics: true, color: ZINC_500 })],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 360 }
                            })
                        )
                    } catch { /* skip */ }
                }
            }
        }

        const wordDoc = new Document({
            styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
            sections: [{
                children: [
                    ...docChildren,
                    new Paragraph({
                        children: [new TextRun({ text: `Laporan dicetak secara sistem pada tanggal: ${generated} oleh Console DP2KBP3A.`, size: 16, color: ZINC_500, italics: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 600 }
                    })
                ]
            }]
        })

        const buffer = await Packer.toBuffer(wordDoc)
        return new Response(buffer as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="Laporan_${data.idLaporan.substring(0, 8)}.docx"`,
            }
        })
    }

    return new Response("Format tidak didukung", { status: 400 })
}
