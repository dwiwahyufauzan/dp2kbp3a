<script lang="ts">
    import { enhance } from '$app/forms';
    import { toasts } from '$lib/stores/toasts.svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
    import type { ActionData, PageData } from './$types';
    import { ShieldCheck, Calendar, MapPin, Users, FileText, CheckCircle2, XCircle, RotateCcw, MessageSquare, ChevronRight, ExternalLink, User, Building2, Clock } from 'lucide-svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    interface AntrianItem {
        idLaporan: string;
        tanggalKegiatan: string;
        lokasiDetail: string;
        namaKegiatan: string | null;
        jumlahPeserta: number;
        jumlahLaki: number | null;
        jumlahPerempuan: number | null;
        deskripsiKegiatan: string | null;
        namaLengkap: string | null;
        namaBidang: string | null;
        createdAt: string;
        dokumentasi: { idDokumentasi: string; filePath: string; tipeFile: string | null }[];
    }

    const antrian = $derived(data.antrian as AntrianItem[]);
    let loading = $state(false);
    let selectedId = $state<string | null>(null);
    let confirmOpen = $state(false);
    let confirmMsg = $state('');
    let pendingFormEl = $state<HTMLFormElement | null>(null);

    const selected = $derived(antrian.find(a => a.idLaporan === selectedId) ?? null);

    function formatTanggal(tgl: string) {
        return new Date(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    function formatTanggalShort(tgl: string) {
        return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function formatRelative(tgl: string) {
        const diff = Date.now() - new Date(tgl).getTime();
        const hours = Math.floor(diff / 3_600_000);
        if (hours < 1) return 'Baru saja';
        if (hours < 24) return `${hours} jam lalu`;
        return `${Math.floor(hours / 24)} hari lalu`;
    }
</script>

<svelte:head><title>Verifikasi Laporan — Console</title></svelte:head>

<div class="max-w-350 mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">

    <!-- HEADER -->
    <header class="border-b border-zinc-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <ShieldCheck class="w-3 h-3" /> Antrian Verifikasi
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">Verifikasi Laporan</h1>
            <p class="text-zinc-500 mt-1 font-light">
                {#if antrian.length > 0}
                    <span class="font-bold text-amber-600">{antrian.length}</span> laporan menunggu tindakan Anda.
                {:else}
                    Tidak ada laporan yang menunggu verifikasi.
                {/if}
            </p>
        </div>
        {#if antrian.length > 0}
            <div class="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span class="text-xs font-bold text-amber-700">{antrian.length} Menunggu Persetujuan</span>
            </div>
        {/if}
    </header>

    {#if antrian.length === 0}
        <div class="flex flex-col items-center justify-center py-24 text-center bg-zinc-50/50 rounded-2xl border border-zinc-100">
            <div class="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 class="w-8 h-8 text-emerald-500" />
            </div>
            <p class="font-bold text-zinc-900 text-lg">Semua laporan sudah diverifikasi</p>
            <p class="text-sm text-zinc-500 mt-1">Tidak ada laporan yang menunggu verifikasi saat ini.</p>
        </div>
    {:else}
        <!-- TWO PANEL LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            <!-- PANEL KIRI: Daftar Antrian -->
            <div class="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Antrian</p>
                    <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full">{antrian.length}</span>
                </div>
                <div class="divide-y divide-zinc-50 max-h-[70vh] overflow-y-auto">
                    {#each antrian as item (item.idLaporan)}
                        <button
                            type="button"
                            onclick={() => selectedId = item.idLaporan}
                            class="w-full text-left px-4 py-4 flex items-start gap-3 transition-colors {selectedId === item.idLaporan ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'}"
                        >
                            <div class="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 {selectedId === item.idLaporan ? 'bg-zinc-700 border border-zinc-600' : 'bg-amber-50 border border-amber-100'}">
                                <span class="text-sm font-black leading-none {selectedId === item.idLaporan ? 'text-white' : 'text-amber-700'}">{new Date(item.tanggalKegiatan).getDate()}</span>
                                <span class="text-[8px] font-bold uppercase {selectedId === item.idLaporan ? 'text-zinc-400' : 'text-amber-500'}">{new Date(item.tanggalKegiatan).toLocaleDateString('id-ID', { month: 'short' })}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold truncate {selectedId === item.idLaporan ? 'text-white' : 'text-zinc-900'}">{item.namaKegiatan ?? '-'}</p>
                                <p class="text-[10px] mt-0.5 truncate {selectedId === item.idLaporan ? 'text-zinc-400' : 'text-zinc-500'}">{item.namaLengkap ?? '-'}</p>
                                <p class="text-[10px] mt-0.5 {selectedId === item.idLaporan ? 'text-zinc-500' : 'text-zinc-400'}">{formatRelative(item.createdAt)}</p>
                            </div>
                            <ChevronRight class="w-3.5 h-3.5 shrink-0 mt-1 {selectedId === item.idLaporan ? 'text-zinc-400' : 'text-zinc-300'}" />
                        </button>
                    {/each}
                </div>
            </div>

            <!-- PANEL KANAN: Detail + Form -->
            <div class="lg:col-span-3">
                {#if selected}
                    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden space-y-0">

                        <!-- Detail Header -->
                        <div class="bg-zinc-950 px-6 py-6">
                            <div class="flex items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest rounded-full">Menunggu Verifikasi</span>
                                        <span class="text-[10px] text-zinc-500 flex items-center gap-1"><Clock class="w-3 h-3" />{formatRelative(selected.createdAt)}</span>
                                    </div>
                                    <h2 class="text-xl font-bold text-white">{selected.namaKegiatan ?? '-'}</h2>
                                </div>
                                <a
                                    href="/laporan/{selected.idLaporan}"
                                    class="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-colors border border-zinc-700"
                                >
                                    <ExternalLink class="w-3.5 h-3.5" /> Buka
                                </a>
                            </div>
                        </div>

                        <!-- Info Grid -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-zinc-100 border-b border-zinc-100">
                            <div class="px-5 py-4">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar class="w-3 h-3" /> Tanggal</p>
                                <p class="text-sm font-bold text-zinc-900">{new Date(selected.tanggalKegiatan).getDate()}</p>
                                <p class="text-xs text-zinc-500">{new Date(selected.tanggalKegiatan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div class="px-5 py-4">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users class="w-3 h-3" /> Peserta</p>
                                <p class="text-sm font-black font-mono text-zinc-900">{selected.jumlahPeserta}</p>
                                {#if selected.jumlahLaki != null || selected.jumlahPerempuan != null}
                                    <p class="text-[10px] text-zinc-400 mt-0.5">
                                        <span class="text-blue-500 font-bold">L {selected.jumlahLaki ?? 0}</span>
                                        <span class="text-zinc-300 mx-1">·</span>
                                        <span class="text-pink-500 font-bold">P {selected.jumlahPerempuan ?? 0}</span>
                                    </p>
                                {/if}
                            </div>
                            <div class="px-5 py-4">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><User class="w-3 h-3" /> Petugas</p>
                                <p class="text-sm font-bold text-zinc-900 truncate">{selected.namaLengkap ?? '-'}</p>
                            </div>
                            <div class="px-5 py-4">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Building2 class="w-3 h-3" /> Bidang</p>
                                <p class="text-sm font-bold text-zinc-900">{selected.namaBidang ?? '—'}</p>
                            </div>
                        </div>

                        <!-- Lokasi -->
                        <div class="px-6 py-4 border-b border-zinc-100">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin class="w-3 h-3" /> Lokasi Kegiatan</p>
                            <p class="text-sm font-semibold text-zinc-800">{selected.lokasiDetail}</p>
                        </div>

                        <!-- Deskripsi -->
                        {#if selected.deskripsiKegiatan}
                            <div class="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1"><FileText class="w-3 h-3" /> Deskripsi Kegiatan</p>
                                <p class="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">{selected.deskripsiKegiatan}</p>
                            </div>
                        {:else}
                            <div class="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText class="w-3 h-3" /> Deskripsi Kegiatan</p>
                                <p class="text-sm text-zinc-400 italic">Tidak ada deskripsi.</p>
                            </div>
                        {/if}

                        <!-- Dokumentasi -->
                        <div class="px-6 py-4 border-b border-zinc-100">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                <FileText class="w-3 h-3" /> Dokumentasi
                                <span class="ml-1 text-zinc-300">({selected.dokumentasi?.length ?? 0} file)</span>
                            </p>
                            {#if selected.dokumentasi && selected.dokumentasi.length > 0}
                                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {#each selected.dokumentasi as dok}
                                        {@const isImage = dok.tipeFile?.startsWith('image/') ?? dok.filePath?.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null}
                                        {@const fileUrl = `/uploads/${dok.filePath}`}
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener"
                                            class="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 hover:border-zinc-300 transition-all aspect-square flex items-center justify-center"
                                        >
                                            {#if isImage}
                                                <img src={fileUrl} alt="dok" class="w-full h-full object-cover" loading="lazy" />
                                            {:else}
                                                <div class="flex flex-col items-center gap-1 text-zinc-500">
                                                    <FileText class="w-6 h-6" />
                                                    <span class="text-[9px] font-bold uppercase">PDF</span>
                                                </div>
                                            {/if}
                                        </a>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-sm text-zinc-400 italic">Tidak ada dokumentasi.</p>
                            {/if}
                        </div>

                        <!-- ACTION FORM -->
                        <form
                            method="POST"
                            action="?/verifikasi"
                            use:enhance={() => {
                                loading = true;
                                return async ({ result, update }) => {
                                    if (result.type === 'success') {
                                        const statusMap: Record<string, string> = { Disetujui: 'disetujui', Ditolak: 'ditolak', Revisi: 'dikembalikan untuk revisi' };
                                        const status = (result.data as { status?: string })?.status ?? '';
                                        toasts.success(`Laporan berhasil ${statusMap[status] ?? 'diproses'}.`);
                                        selectedId = null;
                                    } else if (result.type === 'failure') {
                                        toasts.error((result.data as { error?: string })?.error ?? 'Gagal memverifikasi');
                                    }
                                    await update({ reset: false });
                                    loading = false;
                                };
                            }}
                            class="px-6 py-6 space-y-4"
                        >
                            <input type="hidden" name="id" value={selected.idLaporan} />

                            <div>
                                <label for="catatan-{selected.idLaporan}" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    <span class="flex items-center gap-1.5"><MessageSquare class="w-3 h-3" /> Catatan / Arahan <span class="font-normal text-zinc-400 normal-case tracking-normal">(wajib jika ditolak atau revisi)</span></span>
                                </label>
                                <textarea
                                    id="catatan-{selected.idLaporan}"
                                    name="catatanVerifikator"
                                    rows="4"
                                    placeholder="Tuliskan arahan, alasan penolakan, atau poin yang perlu diperbaiki..."
                                    class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all resize-none placeholder:text-zinc-400"
                                ></textarea>
                            </div>

                            <div class="grid grid-cols-3 gap-3">
                                <button
                                    name="statusVerifikasi" value="Disetujui" type="submit"
                                    disabled={loading}
                                    class="flex flex-col items-center justify-center gap-1.5 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <CheckCircle2 class="w-5 h-5" />
                                    <span class="text-xs">Setujui</span>
                                </button>
                                <button
                                    name="statusVerifikasi" value="Revisi" type="submit"
                                    disabled={loading}
                                    class="flex flex-col items-center justify-center gap-1.5 px-4 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                                >
                                    <RotateCcw class="w-5 h-5" />
                                    <span class="text-xs">Minta Revisi</span>
                                </button>
                                <button
                                    name="statusVerifikasi" value="Ditolak" type="button"
                                    disabled={loading}
                                    onclick={(e) => { pendingFormEl = (e.currentTarget as HTMLElement).closest('form'); confirmMsg = `Tolak laporan "${selected.namaKegiatan}"?`; confirmOpen = true; }}
                                    class="flex flex-col items-center justify-center gap-1.5 px-4 py-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold rounded-xl transition-all"
                                >
                                    <XCircle class="w-5 h-5" />
                                    <span class="text-xs">Tolak</span>
                                </button>
                            </div>

                            {#if loading}
                                <p class="text-xs text-zinc-400 text-center animate-pulse">Menyimpan keputusan...</p>
                            {/if}
                        </form>
                    </div>
                {:else}
                    <!-- Placeholder saat belum dipilih -->
                    <div class="h-full min-h-100 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center p-12">
                        <ShieldCheck class="w-10 h-10 text-zinc-300 mb-4" />
                        <p class="font-bold text-zinc-400">Pilih laporan dari daftar</p>
                        <p class="text-sm text-zinc-400 mt-1">Detail dan form verifikasi akan tampil di sini.</p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<ConfirmDialog
    open={confirmOpen}
    title="Konfirmasi Tolak"
    message={confirmMsg}
    confirmLabel="Ya, Tolak Laporan"
    onConfirm={() => {
        confirmOpen = false;
        if (pendingFormEl) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'statusVerifikasi';
            hidden.value = 'Ditolak';
            pendingFormEl.appendChild(hidden);
            pendingFormEl.requestSubmit();
        }
    }}
    onCancel={() => { confirmOpen = false; pendingFormEl = null; }}
/>
