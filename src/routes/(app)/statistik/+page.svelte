<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { BarChart3, Filter, Users, FileText, CheckCircle2, Clock, PieChart, Activity, RotateCcw } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();

    interface StatsData {
        totalLaporan: number;
        totalPeserta: number;
        totalLaki: number;
        totalPerempuan: number;
        byStatus: Record<string, number>;
        byJenis: { idJenis: string; namaKegiatan: string | null; total: number; totalPeserta: number }[];
        trenBulan: { periode: string; total: number; totalPeserta: number }[];
    }

    const stats = $derived(data.stats as unknown as StatsData);

    // Donut chart gender
    const C = 251.327;
    const totalGender   = $derived((stats.totalLaki ?? 0) + (stats.totalPerempuan ?? 0));
    const lakiArc       = $derived(totalGender > 0 ? (stats.totalLaki    / totalGender) * C : 0);
    const prmpnArc      = $derived(totalGender > 0 ? (stats.totalPerempuan / totalGender) * C : 0);
    const lakiPct       = $derived(totalGender > 0 ? Math.round(stats.totalLaki    / totalGender * 100) : 0);
    const prmpnPct      = $derived(totalGender > 0 ? Math.round(stats.totalPerempuan / totalGender * 100) : 0);

    let tahun = $state(data.tahun ?? String(new Date().getFullYear()));
    let bulan = $state(data.bulan ?? '');
    let idBidang = $state(data.idBidang ?? '');

    const tahunOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
    const bulanOptions = [
        { val: '', label: 'Semua Bulan' },
        { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' },
        { val: '3', label: 'Maret' }, { val: '4', label: 'April' },
        { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' },
        { val: '9', label: 'September' }, { val: '10', label: 'Oktober' },
        { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
    ];

    function applyFilter() {
        const params = new URLSearchParams();
        if (tahun) params.set('tahun', tahun);
        if (bulan) params.set('bulan', bulan);
        if (idBidang) params.set('idBidang', idBidang);
        goto(`/statistik?${params.toString()}`);
    }

    function resetFilter() {
        tahun = String(new Date().getFullYear());
        bulan = '';
        idBidang = '';
        goto('/statistik');
    }

    const maxJenis = $derived(
        stats.byJenis.length > 0 ? Math.max(...stats.byJenis.map((j) => j.total)) : 1
    );
    const maxTren = $derived(
        stats.trenBulan.length > 0 ? Math.max(...stats.trenBulan.map((t) => t.total)) : 1
    );

    const statusList: [string, string][] = [
        ['Disetujui', 'bg-emerald-500'],
        ['Pending', 'bg-amber-400'],
        ['Ditolak', 'bg-rose-500'],
        ['Revisi', 'bg-orange-500']
    ];
</script>

<svelte:head><title>Statistik — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <!-- HEADER -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <BarChart3 class="w-3 h-3" /> Data Analitik
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                Statistik Kegiatan
            </h1>
            <p class="text-zinc-500 mt-1 font-light">Analisis data dan grafik keberhasilan lini lapangan.</p>
        </div>
    </header>

    <!-- FILTER -->
    <div class="flex flex-wrap gap-4 items-end py-4">
        <div class="flex-1 min-w-[120px]">
            <label for="filter-tahun" class="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2">Tahun</label>
            <select
                id="filter-tahun"
                bind:value={tahun}
                class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
            >
                {#each tahunOptions as t}
                    <option value={t}>{t}</option>
                {/each}
            </select>
        </div>
        <div class="flex-1 min-w-[150px]">
            <label for="filter-bulan" class="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2">Bulan</label>
            <select
                id="filter-bulan"
                bind:value={bulan}
                class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
            >
                {#each bulanOptions as b}
                    <option value={b.val}>{b.label}</option>
                {/each}
            </select>
        </div>
        <div class="flex-1 min-w-[200px]">
            <label for="filter-bidang" class="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2">Bidang</label>
            <select
                id="filter-bidang"
                bind:value={idBidang}
                class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
            >
                <option value="">Semua Bidang</option>
                {#each data.bidang as b}
                    <option value={b.idBidang}>{b.namaBidang}</option>
                {/each}
            </select>
        </div>
        <div class="flex items-center gap-2">
            <button
                onclick={applyFilter}
                class="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-zinc-200 whitespace-nowrap flex items-center gap-2"
            >
                <Filter class="w-4 h-4"/> Tampilkan
            </button>
            <button
                onclick={resetFilter}
                disabled={tahun === String(new Date().getFullYear()) && !bulan && !idBidang}
                class="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
                <RotateCcw class="w-4 h-4"/> Reset
            </button>
        </div>
    </div>

    <!-- KPI CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-y border-zinc-100">
        <div class="space-y-1 py-4">
            <div class="flex items-center gap-2 mb-2">
                <FileText class="w-4 h-4 text-zinc-400" />
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Total Laporan</p>
            </div>
            <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{stats.totalLaporan}</p>
        </div>
        <div class="space-y-1 border-l border-zinc-100 pl-8 py-4">
            <div class="flex items-center gap-2 mb-2">
                <Users class="w-4 h-4 text-zinc-400" />
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Total Peserta</p>
            </div>
            <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{stats.totalPeserta.toLocaleString('id-ID')}</p>
        </div>
        <div class="space-y-1 border-l border-zinc-100 pl-8 py-4">
            <div class="flex items-center gap-2 mb-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Disetujui</p>
            </div>
            <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{stats.byStatus?.Disetujui ?? 0}</p>
        </div>
        <div class="space-y-1 border-l border-zinc-100 pl-8 py-4">
            <div class="flex items-center gap-2 mb-2">
                <Clock class="w-4 h-4 text-amber-500" />
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Menunggu</p>
            </div>
            <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{stats.byStatus?.Pending ?? 0}</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Status Distribution -->
        <div class="space-y-6">
            <h2 class="text-sm font-bold text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                <PieChart class="w-4 h-4 text-zinc-400"/> Distribusi Status
            </h2>
            {#if stats.totalLaporan === 0}
                <div class="p-8 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest bg-zinc-50/50 rounded-2xl border border-zinc-100">Tidak ada data</div>
            {:else}
                <div class="space-y-5 py-2">
                    {#each statusList as [label, color]}
                        {@const count = stats.byStatus?.[label] ?? 0}
                        {@const pct = stats.totalLaporan > 0 ? Math.round((count / stats.totalLaporan) * 100) : 0}
                        <div class="flex items-center gap-4 group">
                            <span class="w-20 text-xs font-bold text-zinc-500 shrink-0 uppercase tracking-wide">{label}</span>
                            <div class="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000 {color}" style="width: {pct}%"></div>
                            </div>
                            <span class="w-16 text-right text-sm font-bold text-zinc-900 font-mono">{count}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- By Jenis -->
        <div class="space-y-6 lg:border-l lg:border-zinc-100 lg:pl-8">
            <h2 class="text-sm font-bold text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                <Activity class="w-4 h-4 text-zinc-400"/> Per Jenis Kegiatan
            </h2>
            {#if stats.byJenis.length === 0}
                <div class="p-8 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest bg-zinc-50/50 rounded-2xl border border-zinc-100">Tidak ada data</div>
            {:else}
                <div class="space-y-5 py-2">
                    {#each stats.byJenis as item}
                        {@const pct = maxJenis > 0 ? Math.round((item.total / maxJenis) * 100) : 0}
                        <div class="flex items-center gap-4 group">
                            <span class="w-48 text-xs font-semibold text-zinc-600 truncate shrink-0" title={item.namaKegiatan ?? '-'}>{item.namaKegiatan ?? '-'}</span>
                            <div class="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full bg-zinc-400 group-hover:bg-zinc-800 transition-all duration-1000" style="width: {pct}%"></div>
                            </div>
                            <span class="w-12 text-right text-sm font-bold text-zinc-900 font-mono">{item.total}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <!-- Distribusi Gender -->
    {#if totalGender > 0}
        <div class="pt-8 border-t border-zinc-100">
            <h2 class="text-sm font-bold text-zinc-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users class="w-4 h-4 text-zinc-400"/> Distribusi Gender Peserta
            </h2>
            <div class="flex flex-col sm:flex-row items-center gap-8 bg-zinc-50/50 rounded-3xl border border-zinc-100 p-6">
                <!-- Donut SVG -->
                <div class="relative shrink-0">
                    <svg viewBox="0 0 100 100" class="w-44 h-44 -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f4f4f5" stroke-width="14" />
                        {#if lakiArc > 0}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="14"
                                stroke-dasharray="{lakiArc} {C - lakiArc}" stroke-linecap="butt" />
                        {/if}
                        {#if prmpnArc > 0}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" stroke-width="14"
                                stroke-dasharray="{prmpnArc} {C - prmpnArc}"
                                stroke-dashoffset="{C - lakiArc}" stroke-linecap="butt" />
                        {/if}
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span class="text-xl font-bold text-zinc-900 font-mono leading-none">{totalGender.toLocaleString('id-ID')}</span>
                        <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Peserta</span>
                    </div>
                </div>
                <!-- Legend -->
                <div class="flex flex-col gap-5 flex-1 w-full">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <span class="text-xs font-black text-blue-600">L</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-baseline justify-between mb-1">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Laki-laki</p>
                                <span class="text-sm font-bold text-blue-500">{lakiPct}%</span>
                            </div>
                            <div class="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div class="h-full bg-blue-500 rounded-full transition-all duration-700" style="width:{lakiPct}%"></div>
                            </div>
                            <p class="text-xl font-bold text-zinc-900 font-mono mt-1">{stats.totalLaki.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                            <span class="text-xs font-black text-pink-600">P</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-baseline justify-between mb-1">
                                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Perempuan</p>
                                <span class="text-sm font-bold text-pink-500">{prmpnPct}%</span>
                            </div>
                            <div class="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div class="h-full bg-pink-500 rounded-full transition-all duration-700" style="width:{prmpnPct}%"></div>
                            </div>
                            <p class="text-xl font-bold text-zinc-900 font-mono mt-1">{stats.totalPerempuan.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Tren Bulanan -->
    {#if stats.trenBulan.length > 0}
        <div class="pt-8 border-t border-zinc-100">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-sm font-bold text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 class="w-4 h-4 text-zinc-400" /> Tren Bulan Tahun {tahun}
                </h2>
                <div class="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-zinc-800"></div>Total Laporan</div>
                </div>
            </div>
            
            <div class="relative h-64 pl-8 sm:pl-10">
                <!-- Grid Lines -->
                <div class="absolute inset-y-0 right-0 left-8 sm:left-10 flex flex-col justify-between pt-4 pb-8 pointer-events-none">
                    {#each [100, 75, 50, 25, 0] as pct}
                        <div class="relative w-full border-t border-zinc-100/80 border-dashed">
                            <span class="absolute -left-8 sm:-left-10 -translate-y-1/2 text-[9px] font-bold text-zinc-400 w-6 sm:w-8 text-right font-mono">
                                {Math.round(maxTren * pct / 100)}
                            </span>
                        </div>
                    {/each}
                </div>

                <!-- Bars -->
                <div class="absolute inset-y-0 right-0 left-8 sm:left-10 flex items-end justify-between gap-1 sm:gap-4 pb-8 pt-4 z-10">
                    {#each stats.trenBulan as t}
                        {@const pct = maxTren > 0 ? Math.round((t.total / maxTren) * 100) : 0}
                        <div class="group flex flex-col flex-1 h-full relative items-center justify-end">
                            <div class="w-full max-w-[3rem] h-full flex flex-col justify-end relative">
                                <!-- Ghost background bar -->
                                <div class="absolute inset-x-0 bottom-0 top-0 bg-zinc-50/50 rounded-t-xl group-hover:bg-zinc-50 transition-colors"></div>
                                
                                <!-- Tooltip Overlay -->
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap flex flex-col items-center">
                                    <span class="font-mono text-xs">{t.total}</span>
                                    <span class="text-[8px] text-zinc-400 uppercase">{t.periode}</span>
                                </div>

                                <!-- Value Bar -->
                                <div class="relative w-full bg-zinc-200 group-hover:bg-zinc-800 rounded-t-xl transition-all duration-700 shadow-sm" style="height: {pct}%; min-height: 4px;"></div>
                            </div>
                            
                            <!-- Label -->
                            <div class="absolute top-full mt-3 w-full text-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{t.periode.split(' ')[0].substring(0,3)}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>