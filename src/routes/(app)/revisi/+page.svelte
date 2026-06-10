<script lang="ts">
    import { goto } from '$app/navigation';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import type { PageData } from './$types';
    import type { LaporanItem } from '$lib/types';
    import { ClipboardEdit, ChevronLeft, ChevronRight, ArrowRight, AlertTriangle, MessageSquare } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();

    const laporan = $derived(data.laporan as LaporanItem[]);
    const currentPage = $derived(data.page ?? 1);
    const totalPages  = $derived(data.totalPages ?? 1);
    const total       = $derived(data.total ?? 0);

    function formatTanggal(tgl: string) {
        return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatDateTime(dt: string) {
        return new Date(dt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function goToPage(p: number) {
        goto(`/revisi?page=${p}`);
    }
</script>

<svelte:head><title>Revisi Laporan — DP2KBP3A</title></svelte:head>

<div class="max-w-[1000px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">

    <!-- HEADER -->
    <header class="pb-8 border-b border-zinc-100">
        <div class="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            <AlertTriangle class="w-3 h-3" /> Perlu Tindakan
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-zinc-900">Laporan Perlu Direvisi</h1>
        <p class="text-zinc-500 mt-1 font-light">
            {total > 0
                ? `${total} laporan membutuhkan perhatian Anda — silakan perbaiki sesuai catatan dari verifikator.`
                : 'Tidak ada laporan yang memerlukan revisi saat ini.'}
        </p>
    </header>

    {#if laporan.length === 0}
        <!-- EMPTY STATE -->
        <div class="py-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-[2rem] border border-zinc-100">
            <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <ClipboardEdit class="w-7 h-7 text-emerald-600" />
            </div>
            <h2 class="text-lg font-bold text-zinc-900 mb-1">Semua laporan sudah beres!</h2>
            <p class="text-sm text-zinc-500 max-w-sm">Tidak ada laporan dengan status "Perlu Revisi" untuk Anda saat ini.</p>
            <a href="/laporan" class="mt-6 px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <ArrowRight class="w-4 h-4" /> Lihat Semua Laporan
            </a>
        </div>
    {:else}
        <div class="space-y-4">
            {#each laporan as item}
                <a
                    href="/laporan/{item.idLaporan}"
                    class="group block bg-white rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-50 transition-all p-0 overflow-hidden"
                >
                    <!-- Amber top bar -->
                    <div class="h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>

                    <div class="p-6">
                        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div class="space-y-3 flex-1 min-w-0">
                                <!-- Kegiatan & Bidang -->
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap mb-1">
                                        <StatusBadge status={item.statusVerifikasi} />
                                        {#if (item as LaporanItem & { namaBidang?: string | null }).namaBidang}
                                            <span class="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                {(item as LaporanItem & { namaBidang?: string | null }).namaBidang}
                                            </span>
                                        {/if}
                                    </div>
                                    <h3 class="text-base font-bold text-zinc-900 group-hover:text-amber-700 transition-colors truncate">
                                        {item.namaKegiatan ?? '—'}
                                    </h3>
                                </div>

                                <!-- Catatan Verifikator -->
                                {#if item.catatanVerifikator}
                                    <div class="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <MessageSquare class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Catatan Verifikator</p>
                                            <p class="text-xs text-amber-800 leading-relaxed">{item.catatanVerifikator}</p>
                                        </div>
                                    </div>
                                {/if}

                                <!-- Meta info -->
                                <div class="flex items-center gap-4 flex-wrap text-[10px] text-zinc-400 font-medium">
                                    <span>📅 {formatTanggal(item.tanggalKegiatan)}</span>
                                    <span>📍 {item.lokasiDetail}</span>
                                    <span>👥 {item.jumlahPeserta} orang</span>
                                </div>
                                <p class="text-[10px] text-zinc-400">Diperbarui: {formatDateTime(item.updatedAt)}</p>
                            </div>

                            <!-- CTA -->
                            <div class="shrink-0 flex items-center">
                                <div class="flex items-center gap-2 px-4 py-2.5 bg-amber-500 group-hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                                    <ClipboardEdit class="w-3.5 h-3.5" />
                                    Perbaiki Sekarang
                                    <ArrowRight class="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>

        <!-- PAGINATION -->
        {#if totalPages > 1}
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <p class="text-xs font-bold text-zinc-400 uppercase tracking-[0.1em]">
                    Halaman <span class="text-zinc-800">{currentPage}</span> dari <span class="text-zinc-800">{totalPages}</span>
                </p>
                <div class="flex items-center gap-1 border border-zinc-200 rounded-xl p-1 bg-zinc-50/50">
                    <button
                        onclick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        class="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg hover:bg-white"
                    ><ChevronLeft class="w-4 h-4" /></button>
                    {#each Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const half = 2;
                        let start = Math.max(1, currentPage - half);
                        const end = Math.min(totalPages, start + 4);
                        start = Math.max(1, end - 4);
                        return start + i;
                    }).filter(p => p >= 1 && p <= totalPages) as p}
                        <button
                            onclick={() => goToPage(p)}
                            class="w-8 h-8 text-xs font-bold rounded-lg transition-all {p === currentPage ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-white hover:text-zinc-900'}"
                        >{p}</button>
                    {/each}
                    <button
                        onclick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        class="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg hover:bg-white"
                    ><ChevronRight class="w-4 h-4" /></button>
                </div>
            </div>
        {/if}
    {/if}
</div>
