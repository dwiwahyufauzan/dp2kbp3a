<script lang="ts">
    import { enhance } from '$app/forms';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import { toasts } from '$lib/stores/toasts.svelte';
    import type { ActionData, PageData } from './$types';
    import type { LaporanDetail, DokumentasiLaporan } from '$lib/types';
    import { untrack } from 'svelte';
    import { ChevronLeft, Calendar, User, MapPin, Users, FileText, CheckCircle2, FileX2, Clock, Trash2, Edit2, X, MessageSquare, Download, Check, AlertCircle, History, FileArchive, FileSpreadsheet, ChevronDown, ChevronUp, LayoutGrid, FileDigit } from 'lucide-svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const laporan = $derived(data.laporan as LaporanDetail & {
        riwayatRevisi?: {
            idRiwayat: string;
            tipeAksi: string;
            statusSebelum: string | null;
            statusSesudah: string | null;
            dataLama: Record<string, unknown> | null;
            catatan: string | null;
            createdAt: string;
            namaUser: string | null;
        }[]
    });
    const user = $derived(data.user!);

    const canEdit = $derived(
        (user.namaRole === 'petugas' && laporan.idUser === user.idUser &&
            (laporan.statusVerifikasi === 'Pending' || laporan.statusVerifikasi === 'Revisi')) ||
        user.namaRole === 'admin'
    );

    const canVerify = $derived(user.namaRole === 'kepala_bidang' || user.namaRole === 'admin');
    const canDelete = $derived(user.namaRole === 'admin' || (user.namaRole === 'petugas' && laporan.idUser === user.idUser && laporan.statusVerifikasi === 'Pending'));

    let editMode = $state(false);
    let editLoading = $state(false);
    let verifikasiLoading = $state(false);
    let uploadLoading = $state(false);
    let confirmOpen = $state(false);
    let pendingForm = $state<HTMLFormElement | null>(null);
    let selectedFileName = $state<string | null>(null);
    let showRiwayat = $state(false);
    let selectedBidangId = $state<string>('');

    $effect(() => {
        if (editMode) {
            selectedBidangId = laporan.idBidang ?? '';
        }
    });

    const filteredKegiatan = $derived.by(() => {
        const allKegiatan = data.jenisKegiatan ?? [];
        if (!selectedBidangId) return [];
        return allKegiatan.filter(k => k.idBidang === selectedBidangId);
    });

    const FILE_ACCEPT = 'image/*,application/pdf,application/zip,.zip,.docx,.xlsx,.doc,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    function formatTanggal(tgl: string) {
        return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatDateTime(dt: string) {
        return new Date(dt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const BACKEND = data.backendUrl || 'http://localhost:3000';

    const statusTheme = $derived(() => {
        switch(laporan.statusVerifikasi) {
            case 'Disetujui': return { text: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200' };
            case 'Ditolak': return { text: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-200' };
            case 'Revisi': return { text: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200' };
            default: return { text: 'text-zinc-700', bg: 'bg-zinc-50/50', border: 'border-zinc-200' };
        }
    });

    function getFileType(dok: { tipeFile?: string | null; filePath?: string }) {
        const mime = dok.tipeFile ?? '';
        const path = dok.filePath ?? '';
        const ext = path.split('.').pop()?.toLowerCase() ?? '';
        if (mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image';
        if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
        if (mime.includes('zip') || ext === 'zip') return 'zip';
        if (mime.includes('word') || ['docx','doc'].includes(ext)) return 'word';
        if (mime.includes('sheet') || mime.includes('excel') || ['xlsx','xls'].includes(ext)) return 'excel';
        return 'other';
    }

    function getAksiLabel(tipeAksi: string, statusSesudah: string | null) {
        if (tipeAksi === 'verifikasi') {
            if (statusSesudah === 'Disetujui') return { label: 'Disetujui', cls: 'bg-emerald-100 text-emerald-700' };
            if (statusSesudah === 'Ditolak') return { label: 'Ditolak', cls: 'bg-rose-100 text-rose-700' };
            if (statusSesudah === 'Revisi') return { label: 'Diminta Revisi', cls: 'bg-amber-100 text-amber-700' };
            return { label: 'Verifikasi', cls: 'bg-zinc-100 text-zinc-600' };
        }
        return { label: 'Edit Data', cls: 'bg-blue-100 text-blue-700' };
    }

    $effect(() => {
        if (form) {
            const f = form;
            untrack(() => {
                if (f.editSuccess) { toasts.success('Laporan berhasil diperbarui.'); editMode = false; }
                if (f.verifikasiSuccess) toasts.success('Verifikasi berhasil disimpan.');
                if (f.editError) toasts.error(f.editError);
                if (f.verifikasiError) toasts.error(f.verifikasiError);
                if (f.uploadError) toasts.error(f.uploadError);
                if (f.hapusError) toasts.error(f.hapusError);
                if (f.hapusLaporanError) toasts.error(f.hapusLaporanError);
                if (f.uploadSuccess) selectedFileName = null;
            });
        }
    });

    function getDiffs(riwayat: any, idx: number) {
        if (!riwayat.dataLama) return [];
        
        let stateAfter: Record<string, any> = {};
        if (idx === 0) {
            stateAfter = {
                idBidang: laporan.idBidang,
                idJenis: laporan.idJenis,
                tanggalKegiatan: laporan.tanggalKegiatan,
                lokasiDetail: laporan.lokasiDetail,
                jumlahPeserta: laporan.jumlahPeserta,
                jumlahLaki: laporan.jumlahLaki,
                jumlahPerempuan: laporan.jumlahPerempuan,
                deskripsiKegiatan: laporan.deskripsiKegiatan
            };
        } else {
            const nextNewer = laporan.riwayatRevisi ? laporan.riwayatRevisi[idx - 1] : null;
            stateAfter = nextNewer?.dataLama ?? {};
        }

        const dataLama = riwayat.dataLama;
        const diffs = [];

        const fields = [
            { key: 'idBidang', label: 'Bidang', format: (id: any) => data.bidangList?.find(b => b.idBidang === id)?.namaBidang ?? String(id ?? '-') },
            { key: 'idJenis', label: 'Jenis Kegiatan', format: (id: any) => data.jenisKegiatan?.find(k => k.idJenis === id)?.namaKegiatan ?? String(id ?? '-') },
            { key: 'tanggalKegiatan', label: 'Tanggal', format: (v: any) => v ? formatTanggal(String(v)) : '-' },
            { key: 'lokasiDetail', label: 'Lokasi Detail', format: (v: any) => String(v ?? '-') },
            { key: 'jumlahPeserta', label: 'Total Peserta', format: (v: any) => v !== undefined && v !== null ? `${v} Orang` : '-' },
            { key: 'jumlahLaki', label: 'Peserta Laki-laki', format: (v: any) => v !== null && v !== undefined ? `${v} Orang` : '-' },
            { key: 'jumlahPerempuan', label: 'Peserta Perempuan', format: (v: any) => v !== null && v !== undefined ? `${v} Orang` : '-' },
            { key: 'deskripsiKegiatan', label: 'Deskripsi', format: (v: any) => String(v ?? '-') },
        ];

        for (const field of fields) {
            let valBefore = dataLama[field.key];
            let valAfter = stateAfter[field.key];
            
            let valBeforeComp = valBefore;
            let valAfterComp = valAfter;
            if (field.key === 'tanggalKegiatan') {
                if (valBeforeComp) valBeforeComp = new Date(valBeforeComp).toISOString().split('T')[0];
                if (valAfterComp) valAfterComp = new Date(valAfterComp).toISOString().split('T')[0];
            }

            if (String(valBeforeComp ?? '') !== String(valAfterComp ?? '')) {
                diffs.push({
                    label: field.label,
                    before: field.format(valBefore),
                    after: field.format(valAfter)
                });
            }
        }

        return diffs;
    }
</script>

<svelte:head><title>Detail Laporan — DP2KBP3A</title></svelte:head>

<div class="max-w-[1000px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <!-- BREADCRUMB / NAV -->
    <a href="/laporan" class="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-900 transition-colors">
        <ChevronLeft class="w-4 h-4" /> Kembali ke Laporan
    </a>

    <!-- FLASH MESSAGES -->
    {#if form?.editSuccess || form?.verifikasiSuccess}
        <div class="p-4 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            {form?.editSuccess ? 'Laporan berhasil diperbarui.' : 'Verifikasi berhasil disimpan.'}
        </div>
    {/if}
    {#if form?.editError || form?.verifikasiError || form?.uploadError || form?.hapusError || form?.hapusLaporanError}
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
            <FileX2 class="w-5 h-5" />
            {form?.editError ?? form?.verifikasiError ?? form?.uploadError ?? form?.hapusError ?? form?.hapusLaporanError}
        </div>
    {/if}

    <!-- MAIN HEADER -->
    <header class="pb-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <StatusBadge status={laporan.statusVerifikasi} />
                <span class="text-zinc-300 font-bold">&middot;</span>
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar class="w-3 h-3" /> {formatTanggal(laporan.tanggalKegiatan)}
                </span>
            </div>
            
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">{laporan.namaKegiatan ?? '-'}</h1>
            
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                    {laporan.namaLengkap?.substring(0,2) ?? '?'}
                </div>
                <p class="text-sm font-medium text-zinc-500">
                    Oleh <span class="font-bold text-zinc-900">{laporan.namaLengkap ?? '-'}</span>
                </p>
            </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex items-center gap-3 shrink-0">
            {#if !editMode}
                <a
                    href={`/laporan/${laporan.idLaporan}/export?format=word`}
                    class="px-4 py-2.5 border border-zinc-200 text-blue-600 bg-white text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
                >
                    <FileText class="w-4 h-4" /> Word
                </a>
                <a
                    href={`/laporan/${laporan.idLaporan}/export?format=pdf`}
                    class="px-4 py-2.5 border border-zinc-200 text-rose-600 bg-white text-xs font-bold rounded-xl hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2"
                >
                    <FileDigit class="w-4 h-4" /> PDF
                </a>
            {/if}
            {#if canEdit && !editMode}
                <button
                    onclick={() => (editMode = true)}
                    class="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-800 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2"
                >
                    <Edit2 class="w-4 h-4" /> Edit Data
                </button>
            {/if}
            {#if canDelete}
                <form method="POST" action="?/hapusLaporan" use:enhance={() => { return async ({ update }) => { await update() } }}>
                    <button
                        type="button"
                        onclick={(e) => { pendingForm = (e.currentTarget as HTMLElement).closest('form'); confirmOpen = true; }}
                        class="p-2.5 bg-white border border-zinc-200 text-zinc-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                        aria-label="Hapus Laporan"
                    >
                        <Trash2 class="w-5 h-5" />
                    </button>
                </form>
            {/if}
        </div>
    </header>

    <!-- CONTENT DATA OR EDIT FORM -->
    <div>
        {#if editMode && canEdit}
            <!-- EDIT FORM -->
            <div class="bg-zinc-50/50 rounded-[2rem] border border-zinc-100 p-6 sm:p-8">
                <div class="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100">
                    <h2 class="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Edit2 class="w-5 h-5 text-zinc-400" /> Mode Edit Laporan
                    </h2>
                    <button onclick={() => (editMode = false)} class="p-2 bg-white border border-zinc-200 text-zinc-400 rounded-xl hover:text-zinc-900 transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>
                
                <form
                    method="POST"
                    action="?/edit"
                    use:enhance={({ formData, cancel }) => {
                        const jpStr = formData.get('jumlahPeserta');
                        const jlVal = formData.get('jumlahLaki');
                        const jpmpVal = formData.get('jumlahPerempuan');

                        const jp = jpStr ? parseInt(jpStr.toString(), 10) || 0 : 0;
                        const hasLaki = jlVal !== null && jlVal !== '';
                        const hasPerempuan = jpmpVal !== null && jpmpVal !== '';

                        if (hasLaki || hasPerempuan) {
                            const jl = hasLaki ? parseInt(jlVal.toString(), 10) || 0 : 0;
                            const jpm = hasPerempuan ? parseInt(jpmpVal.toString(), 10) || 0 : 0;

                            if (jl + jpm !== jp) {
                                toasts.error(`Jumlah Laki-laki (${jl}) + Perempuan (${jpm}) harus sama dengan Total Peserta (${jp})`);
                                cancel();
                                return;
                            }
                        }

                        editLoading = true;
                        return async ({ update }) => {
                            await update({ reset: false });
                            editLoading = false;
                            editMode = false;
                        };
                    }}
                    class="space-y-6"
                >
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <LayoutGrid class="w-3 h-3" /> Bidang Kegiatan
                            </label>
                            <select
                                name="idBidang"
                                bind:value={selectedBidangId}
                                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                            >
                                <option value="">-- Pilih Bidang --</option>
                                {#each data.bidangList as b}
                                    <option value={b.idBidang}>{b.namaBidang}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <FileText class="w-3 h-3" /> Jenis Kegiatan
                            </label>
                            <select
                                name="idJenis"
                                disabled={!selectedBidangId || filteredKegiatan.length === 0}
                                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <option value="">{selectedBidangId ? '-- Pilih Jenis Kegiatan --' : '-- Pilih bidang dahulu --'}</option>
                                {#each filteredKegiatan as jenis}
                                    <option value={jenis.idJenis} selected={laporan.idJenis === jenis.idJenis}>
                                        {jenis.namaKegiatan}
                                    </option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <Calendar class="w-3 h-3" /> Tanggal Kegiatan
                            </label>
                            <input
                                name="tanggalKegiatan"
                                type="date"
                                value={laporan.tanggalKegiatan}
                                max={new Date().toISOString().split('T')[0]}
                                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                            />
                        </div>
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <MapPin class="w-3 h-3" /> Lokasi Kegiatan
                            </label>
                            <input
                                name="lokasiDetail"
                                type="text"
                                value={laporan.lokasiDetail}
                                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                <Users class="w-3 h-3" /> Jumlah Peserta
                            </label>
                            <input
                                name="jumlahPeserta"
                                type="number"
                                min="1"
                                value={laporan.jumlahPeserta}
                                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <!-- Placeholder to keep the 2-column layout aligned -->
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Jumlah Laki-laki</label>
                            <input name="jumlahLaki" type="number" min="0" value={laporan.jumlahLaki ?? ''} class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-mono" />
                        </div>
                        <div>
                            <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Jumlah Perempuan</label>
                            <input name="jumlahPerempuan" type="number" min="0" value={laporan.jumlahPerempuan ?? ''} class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-mono" />
                        </div>
                    </div>
                    <div>
                        <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Deskripsi Lengkap
                        </label>
                        <textarea
                            name="deskripsiKegiatan"
                            rows="6"
                            class="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all resize-y leading-relaxed"
                        >{laporan.deskripsiKegiatan}</textarea>
                    </div>
                    <div class="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-zinc-100">
                        <button
                            type="button"
                            onclick={() => (editMode = false)}
                            class="px-5 py-2.5 bg-white text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors"
                        >Batal</button>
                        <button
                            type="submit"
                            disabled={editLoading}
                            class="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            {#if editLoading} Memproses... {:else} <Check class="w-4 h-4" /> Simpan Perubahan {/if}
                        </button>
                    </div>
                </form>
            </div>
        {:else}
            <!-- DISPLAY DATA -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Info box 1 -->
                <div class="bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100 md:col-span-1 border-t-[3px] border-t-zinc-400">
                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2 flex items-center gap-2"><MapPin class="w-3 h-3" /> Lokasi Detail</p>
                    <p class="text-sm font-bold text-zinc-900 leading-snug">{laporan.lokasiDetail}</p>
                    <div class="mt-4 pt-4 border-t border-zinc-100">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2 flex items-center gap-2"><Users class="w-3 h-3" /> Peserta</p>
                        <p class="text-xl font-bold font-mono text-zinc-900">{laporan.jumlahPeserta} <span class="text-xs font-semibold text-zinc-500 font-sans tracking-normal uppercase">Orang</span></p>
                        {#if laporan.jumlahLaki || laporan.jumlahPerempuan}
                            <div class="flex gap-3 mt-1">
                                {#if laporan.jumlahLaki}<span class="text-[10px] font-mono text-blue-500 font-bold">{laporan.jumlahLaki}L</span>{/if}
                                {#if laporan.jumlahPerempuan}<span class="text-[10px] font-mono text-pink-500 font-bold">{laporan.jumlahPerempuan}P</span>{/if}
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Info box 2 (Deskripsi) -->
                <div class="md:col-span-2">
                    <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText class="w-4 h-4 text-zinc-400"/> Hasil & Deskripsi</h3>
                    <div class="text-sm text-zinc-700 whitespace-pre-line leading-loose pr-4">
                        {laporan.deskripsiKegiatan}
                    </div>
                </div>
            </div>

            <!-- Notes Verifikator -->
            {#if laporan.catatanVerifikator}
                <div class="mb-8 p-6 {statusTheme().bg} border-l-4 {statusTheme().border} rounded-r-2xl">
                    <h3 class="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3 {statusTheme().text}">
                        <MessageSquare class="w-4 h-4" /> Catatan Verifikator
                    </h3>
                    <p class="text-sm font-medium text-zinc-800 whitespace-pre-line leading-relaxed">{laporan.catatanVerifikator}</p>
                </div>
            {/if}
        {/if}
    </div>

    <!-- VERIFIKASI KEPALA BIDANG/ADMIN -->
    {#if canVerify && laporan.statusVerifikasi === 'Pending'}
        <div class="bg-zinc-900 rounded-[2rem] p-6 sm:p-8 text-white mt-12 shadow-xl">
            <div class="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
                <AlertCircle class="w-6 h-6 text-amber-400" />
                <div>
                    <h2 class="text-lg font-bold">Tindakan Verifikasi</h2>
                    <p class="text-sm font-medium text-zinc-400">Berikan keputusan untuk laporan ini.</p>
                </div>
            </div>
            
            <form
                method="POST"
                action="?/verifikasi"
                use:enhance={() => {
                    verifikasiLoading = true;
                    return async ({ update }) => {
                        await update({ reset: false });
                        verifikasiLoading = false;
                    };
                }}
            >
                <div class="mb-6">
                    <label class="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                        <MessageSquare class="w-3 h-3" /> Catatan & Arahan (Opsional/Wajib jika ditolak)
                    </label>
                    <textarea
                        name="catatanVerifikator"
                        rows="3"
                        placeholder="Berikan alasan atau arahan perbaikan jika diperlukan..."
                        class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600 transition-all resize-y placeholder:text-zinc-600"
                    ></textarea>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        name="statusVerifikasi"
                        value="Disetujui"
                        type="submit"
                        class="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    ><CheckCircle2 class="w-4 h-4"/> Setujui Laporan</button>
                    
                    <button
                        name="statusVerifikasi"
                        value="Revisi"
                        type="submit"
                        class="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    ><Edit2 class="w-4 h-4"/> Minta Revisi</button>
                    
                    <button
                        name="statusVerifikasi"
                        value="Ditolak"
                        type="submit"
                        class="flex-1 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    ><FileX2 class="w-4 h-4"/> Tolak Laporan</button>
                </div>
            </form>
        </div>
    {/if}

    <!-- DOKUMENTASI -->
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-zinc-100 flex items-center gap-3">
            <Download class="w-4 h-4 text-zinc-400" />
            <h2 class="font-bold text-zinc-900">Dokumentasi</h2>
            <span class="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{laporan.dokumentasi?.length ?? 0} file</span>
        </div>

        <!-- File list -->
        {#if laporan.dokumentasi && laporan.dokumentasi.length > 0}
            <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {#each laporan.dokumentasi as dok}
                    {@const fileType = getFileType(dok)}
                    {@const fileUrl = `/uploads/${dok.filePath}`}
                    <div class="group relative rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 hover:border-zinc-300 transition-all">
                        {#if fileType === 'image'}
                            <a href={fileUrl} target="_blank" rel="noopener" class="block aspect-square">
                                <img src={fileUrl} alt="dokumentasi" class="w-full h-full object-cover" loading="lazy" />
                            </a>
                        {:else if fileType === 'pdf'}
                            <a href={fileUrl} target="_blank" rel="noopener" class="flex flex-col items-center justify-center gap-2 aspect-square text-rose-500 hover:text-rose-700 transition-colors">
                                <FileText class="w-8 h-8" />
                                <span class="text-[10px] font-bold uppercase tracking-widest">PDF</span>
                                {#if (dok as { namaAsli?: string }).namaAsli}
                                    <span class="text-[9px] text-zinc-400 px-2 text-center truncate w-full">{(dok as { namaAsli?: string }).namaAsli}</span>
                                {/if}
                            </a>
                        {:else if fileType === 'zip'}
                            <a href={fileUrl} target="_blank" rel="noopener" class="flex flex-col items-center justify-center gap-2 aspect-square text-amber-600 hover:text-amber-800 transition-colors">
                                <FileArchive class="w-8 h-8" />
                                <span class="text-[10px] font-bold uppercase tracking-widest">ZIP</span>
                                {#if (dok as { namaAsli?: string }).namaAsli}
                                    <span class="text-[9px] text-zinc-400 px-2 text-center truncate w-full">{(dok as { namaAsli?: string }).namaAsli}</span>
                                {/if}
                            </a>
                        {:else if fileType === 'word'}
                            <a href={fileUrl} target="_blank" rel="noopener" class="flex flex-col items-center justify-center gap-2 aspect-square text-indigo-600 hover:text-indigo-800 transition-colors">
                                <FileText class="w-8 h-8" />
                                <span class="text-[10px] font-bold uppercase tracking-widest">WORD</span>
                                {#if (dok as { namaAsli?: string }).namaAsli}
                                    <span class="text-[9px] text-zinc-400 px-2 text-center truncate w-full">{(dok as { namaAsli?: string }).namaAsli}</span>
                                {/if}
                            </a>
                        {:else if fileType === 'excel'}
                            <a href={fileUrl} target="_blank" rel="noopener" class="flex flex-col items-center justify-center gap-2 aspect-square text-emerald-600 hover:text-emerald-800 transition-colors">
                                <FileSpreadsheet class="w-8 h-8" />
                                <span class="text-[10px] font-bold uppercase tracking-widest">EXCEL</span>
                                {#if (dok as { namaAsli?: string }).namaAsli}
                                    <span class="text-[9px] text-zinc-400 px-2 text-center truncate w-full">{(dok as { namaAsli?: string }).namaAsli}</span>
                                {/if}
                            </a>
                        {:else}
                            <a href={fileUrl} target="_blank" rel="noopener" class="flex flex-col items-center justify-center gap-2 aspect-square text-zinc-500 hover:text-zinc-900 transition-colors">
                                <FileText class="w-8 h-8" />
                                <span class="text-[10px] font-bold uppercase tracking-widest">FILE</span>
                            </a>
                        {/if}

                        {#if canEdit}
                            <form
                                method="POST"
                                action="?/hapusDokumentasi"
                                use:enhance={() => {
                                    return async ({ update }) => { await update(); };
                                }}
                                class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <input type="hidden" name="idDok" value={dok.idDokumentasi} />
                                <button
                                    type="button"
                                    onclick={(e) => { pendingForm = (e.currentTarget as HTMLElement).closest('form'); confirmOpen = true; }}
                                    class="w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-md transition-colors"
                                    aria-label="Hapus dokumen"
                                >
                                    <X class="w-3 h-3" />
                                </button>
                            </form>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <div class="px-6 py-8 text-center text-zinc-400">
                <FileText class="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                <p class="text-sm font-medium">Belum ada dokumentasi yang diunggah.</p>
            </div>
        {/if}

        {#if canEdit}
            <div class="px-6 py-5 border-t border-zinc-100 bg-zinc-50/40">
                <p class="text-[10px] text-zinc-400 mb-2 font-medium">Format: Gambar, PDF, ZIP, Word (.docx), Excel (.xlsx) — Maks. 20 MB</p>
                <form
                    method="POST"
                    action="?/uploadDokumentasi"
                    enctype="multipart/form-data"
                    use:enhance={() => {
                        uploadLoading = true;
                        return async ({ update }) => { await update(); uploadLoading = false; };
                    }}
                    class="flex items-center gap-3"
                >
                    <label class="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors group">
                        <Download class="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                        <span class="text-sm text-zinc-500 truncate">
                            {selectedFileName ?? 'Pilih file (Gambar, PDF, ZIP, Word, Excel)'}
                        </span>
                        <input
                            type="file"
                            name="file"
                            accept={FILE_ACCEPT}
                            class="hidden"
                            onchange={(e) => {
                                const f = (e.currentTarget as HTMLInputElement).files?.[0];
                                selectedFileName = f ? f.name : null;
                            }}
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={uploadLoading || !selectedFileName}
                        class="shrink-0 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl transition-all"
                    >
                        {uploadLoading ? 'Mengunggah...' : 'Unggah'}
                    </button>
                </form>
            </div>
        {/if}
    </div>

    <!-- RIWAYAT REVISI -->
    {#if laporan.riwayatRevisi && laporan.riwayatRevisi.length > 0}
        <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <button
                onclick={() => (showRiwayat = !showRiwayat)}
                class="w-full px-6 py-5 border-b border-zinc-100 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
            >
                <History class="w-4 h-4 text-zinc-400" />
                <h2 class="font-bold text-zinc-900">Riwayat Revisi & Verifikasi</h2>
                <span class="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-2">{laporan.riwayatRevisi.length} catatan</span>
                {#if showRiwayat}
                    <ChevronUp class="w-4 h-4 text-zinc-400" />
                {:else}
                    <ChevronDown class="w-4 h-4 text-zinc-400" />
                {/if}
            </button>

            {#if showRiwayat}
                <div class="p-6 space-y-4">
                    {#each laporan.riwayatRevisi as riwayat}
                        {@const aksi = getAksiLabel(riwayat.tipeAksi, riwayat.statusSesudah)}
                        <div class="flex gap-4">
                            <!-- Timeline dot -->
                            <div class="flex flex-col items-center">
                                <div class="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                    {#if riwayat.tipeAksi === 'verifikasi'}
                                        <CheckCircle2 class="w-4 h-4 text-zinc-500" />
                                    {:else}
                                        <Edit2 class="w-4 h-4 text-zinc-500" />
                                    {/if}
                                </div>
                                <div class="w-px flex-1 bg-zinc-100 mt-2 min-h-[1rem]"></div>
                            </div>
                            <!-- Timeline content -->
                            <div class="flex-1 pb-4">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="text-xs font-bold px-2 py-0.5 rounded-full {aksi.cls}">{aksi.label}</span>
                                    {#if riwayat.namaUser}
                                        <span class="text-xs text-zinc-500">oleh <span class="font-semibold text-zinc-700">{riwayat.namaUser}</span></span>
                                    {/if}
                                </div>
                                <p class="text-[10px] text-zinc-400 font-mono mb-2">{formatDateTime(riwayat.createdAt)}</p>
                                
                                {#if riwayat.catatan}
                                    <div class="bg-zinc-50 rounded-lg px-3 py-2 text-xs text-zinc-600 italic border border-zinc-100">
                                        "{riwayat.catatan}"
                                    </div>
                                {/if}

                                {#if riwayat.dataLama}
                                    {@const diffs = getDiffs(riwayat, laporan.riwayatRevisi.indexOf(riwayat))}
                                    {#if diffs.length > 0}
                                        <div class="mt-3 overflow-hidden border border-zinc-200 rounded-xl bg-white shadow-sm max-w-2xl">
                                            <table class="w-full text-left border-collapse text-[11px] sm:text-xs">
                                                <thead>
                                                    <tr class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                                                        <th class="p-2 sm:p-3">Kolom / Field</th>
                                                        <th class="p-2 sm:p-3">Sebelum</th>
                                                        <th class="p-2 sm:p-3">Sesudah</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-zinc-100 font-medium">
                                                    {#each diffs as diff}
                                                        <tr class="hover:bg-zinc-50/50">
                                                            <td class="p-2 sm:p-3 font-bold text-zinc-700">{diff.label}</td>
                                                            <td class="p-2 sm:p-3 text-rose-600 line-through bg-rose-50/10">{diff.before}</td>
                                                            <td class="p-2 sm:p-3 text-emerald-600 font-semibold bg-emerald-50/10">{diff.after}</td>
                                                        </tr>
                                                    {/each}
                                                </tbody>
                                            </table>
                                        </div>
                                    {:else}
                                        <details class="mt-2">
                                            <summary class="text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-600 font-medium">Lihat snapshot data lama (tidak ada perubahan field terdeteksi)</summary>
                                            <div class="mt-2 bg-zinc-50 rounded-lg p-3 text-[10px] font-mono text-zinc-500 space-y-1 border border-zinc-100">
                                                {#each Object.entries(riwayat.dataLama) as [key, val]}
                                                    {#if val !== null && val !== undefined}
                                                        <div><span class="font-bold text-zinc-400">{key}:</span> {String(val)}</div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </details>
                                    {/if}
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<ConfirmDialog
    open={confirmOpen}
    message="Apakah Anda yakin ingin menghapus?"
    onConfirm={() => { confirmOpen = false; pendingForm?.requestSubmit(); }}
    onCancel={() => { confirmOpen = false; pendingForm = null; }}
/>