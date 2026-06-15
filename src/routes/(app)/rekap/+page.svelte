<script lang="ts">
    import { goto } from '$app/navigation';
    import { untrack } from 'svelte';
    import type { PageData } from './$types';
    import { FilePieChart, Filter, RotateCcw, Download, ClipboardList, Calendar, FileText, FileSpreadsheet, FileDigit } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();

    interface RekapRow {
        idUser: string;
        namaLengkap: string;
        namaBidang: string | null;
        totalLaporan: number;
        totalPeserta: number;
        totalDisetujui: number;
        totalMenunggu: number;
        totalDitolak: number;
        totalRevisi: number;
    }

    const rekap = $derived(data.rekap as RekapRow[]);
    let periodeValue = $state(untrack(() => data.periode ?? ''));
    let idBidang = $state(untrack(() => data.idBidang ?? ''));
    let idUser = $state(untrack(() => data.idUser ?? ''));
    let kecamatan = $state(untrack(() => data.kecamatan ?? ''));
    let startDate = $state(untrack(() => data.startDate ?? ''));
    let endDate = $state(untrack(() => data.endDate ?? ''));

    // Determine current type of periode
    let filterType = $state<'harian' | 'bulanan' | 'tahunan' | 'range'>('bulanan');

    $effect(() => {
        untrack(() => {
            if (data.startDate || data.endDate) filterType = 'range';
            else if (periodeValue.length === 10) filterType = 'harian';
            else if (periodeValue.length === 7) filterType = 'bulanan';
            else if (periodeValue.length === 4) filterType = 'tahunan';
        });
    });

    function applyFilter() {
        const params = new URLSearchParams();
        if (filterType === 'range') {
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
        } else {
            if (periodeValue) params.set('periode', periodeValue);
        }
        if (idBidang) params.set('idBidang', idBidang);
        if (idUser) params.set('idUser', idUser);
        if (kecamatan) params.set('kecamatan', kecamatan);
        goto(`/rekap?${params.toString()}`);
    }

    function resetFilter() {
        periodeValue = '';
        idBidang = '';
        idUser = '';
        kecamatan = '';
        startDate = '';
        endDate = '';
        filterType = 'bulanan';
        goto('/rekap');
    }

    function handleExport(format: 'excel' | 'pdf' | 'word' | 'csv') {
        const params = new URLSearchParams();
        if (filterType === 'range') {
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
        } else {
            if (periodeValue) params.set('periode', periodeValue);
        }
        if (idBidang) params.set('idBidang', idBidang);
        if (idUser) params.set('idUser', idUser);
        if (kecamatan) params.set('kecamatan', kecamatan);
        
        if (format === 'csv') {
            window.location.href = `/rekap/export.csv?${params.toString()}`;
        } else {
            params.set('format', format);
            window.location.href = `/rekap/export?${params.toString()}`;
        }
    }

    function handleTypeChange() {
        periodeValue = ''; // reset value when type changes
        startDate = '';
        endDate = '';
    }

    const totalAll = $derived(rekap.reduce((s, r) => s + Number(r.totalLaporan), 0));
    const totalPeserta = $derived(rekap.reduce((s, r) => s + Number(r.totalPeserta), 0));
</script>

<svelte:head><title>Rekapitulasi — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    
    <!-- HEADER & ACTIONS -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <FilePieChart class="w-3 h-3" /> Data Analytics
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">Rekapitulasi Kegiatan</h1>
            <p class="text-zinc-500 mt-1 font-light">Analisis performa dan distribusi laporan harian, bulanan, tahunan.</p>
        </div>

        {#if rekap.length > 0}
            <div class="flex flex-wrap items-center gap-2">
                <button 
                    onclick={() => handleExport('word')}
                    class="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-blue-600 bg-white text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                >
                    <FileText class="w-4 h-4" /> Word
                </button>
                <button 
                    onclick={() => handleExport('pdf')}
                    class="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-rose-600 bg-white text-xs font-bold rounded-xl hover:bg-rose-50 transition-all shadow-sm"
                >
                    <FileDigit class="w-4 h-4" /> PDF
                </button>
                <button 
                    onclick={() => handleExport('excel')}
                    class="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                >
                    <FileSpreadsheet class="w-4 h-4" /> Excel
                </button>
            </div>
        {/if}
    </header>

    <!-- FILTER BAR: ULTRA CLEAN -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
        <!-- Row 1 -->
        <div class="md:col-span-3">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Jenis Filter</label>
            <select
                bind:value={filterType}
                onchange={handleTypeChange}
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
            >
                <option value="harian">Harian</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
                <option value="range">Rentang Tanggal (Kustom)</option>
            </select>
        </div>

        <div class="md:col-span-5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Data Waktu</label>
            {#if filterType === 'harian'}
                <input
                    type="date"
                    bind:value={periodeValue}
                    class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                />
            {:else if filterType === 'bulanan'}
                <input
                    type="month"
                    bind:value={periodeValue}
                    class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                />
            {:else if filterType === 'tahunan'}
                <input
                    type="number"
                    min="2000" max="2100"
                    placeholder="YYYY (Misal: 2026)"
                    bind:value={periodeValue}
                    class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all font-mono"
                />
            {:else}
                <div class="flex items-center gap-2">
                    <input
                        type="date"
                        bind:value={startDate}
                        class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    />
                    <span class="text-zinc-400 text-xs font-semibold">s.d.</span>
                    <input
                        type="date"
                        bind:value={endDate}
                        class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    />
                </div>
            {/if}
        </div>

        <div class="md:col-span-4">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Bidang Kerja</label>
            <select
                bind:value={idBidang}
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
            >
                <option value="">Semua Bidang</option>
                {#each data.bidang as b}
                    <option value={b.idBidang}>{b.namaBidang}</option>
                {/each}
            </select>
        </div>

        <!-- Row 2 -->
        <div class="md:col-span-5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Petugas Lapangan</label>
            <select
                bind:value={idUser}
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
            >
                <option value="">Semua Petugas</option>
                {#each data.petugasList as p}
                    <option value={p.idUser}>{p.namaLengkap}</option>
                {/each}
            </select>
        </div>

        <div class="md:col-span-4">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Wilayah Kecamatan</label>
            <select
                bind:value={kecamatan}
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
            >
                <option value="">Semua Kecamatan</option>
                {#each data.kecamatanList as k}
                    <option value={k.namaKecamatan}>{k.namaKecamatan}</option>
                {/each}
            </select>
        </div>

        <div class="md:col-span-3 flex items-center gap-2 pt-5">
            <button
                onclick={applyFilter}
                class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md"
            >
                <Filter class="w-4 h-4" /> Terapkan
            </button>
            <button
                onclick={resetFilter}
                disabled={!periodeValue && !idBidang && !idUser && !kecamatan && !startDate && !endDate}
                class="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-white"
            >
                <RotateCcw class="w-4 h-4" /> Reset
            </button>
        </div>
    </div>

    <!-- KPI CARDS: MINIMALIST BORDERLESS -->
    {#if rekap.length > 0}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-4">
            <div class="space-y-1">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Total Laporan</p>
                <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{totalAll}</p>
            </div>
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Target Peserta</p>
                <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{totalPeserta.toLocaleString('id-ID')}</p>
            </div>
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Aktifitas Petugas</p>
                <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{rekap.length}</p>
            </div>
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Avg Efisiensi</p>
                <p class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono">{rekap.length > 0 ? (totalAll / rekap.length).toFixed(1) : '0'}</p>
            </div>
        </div>
    {/if}

    <!-- TABLE AREA -->
    <div class="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {#if rekap.length === 0}
            <div class="p-20 text-center flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4 border border-zinc-100">
                    <ClipboardList class="w-8 h-8" />
                </div>
                <h3 class="text-zinc-900 font-bold uppercase text-xs tracking-widest">No Records Found</h3>
                <p class="text-zinc-400 text-sm mt-1 font-light">Silakan ubah jenis filter (Harian/Bulanan/Tahunan) lalu terapkan seleksi.</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-zinc-100">
                    <thead class="bg-zinc-50/50">
                        <tr>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nama Petugas</th>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden md:table-cell">Bidang</th>
                            <th class="px-6 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</th>
                            <th class="px-6 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Peserta</th>
                            <th class="px-6 py-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden lg:table-cell">Status (D/P/R/T)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50">
                        {#each rekap as row}
                            <tr class="group hover:bg-zinc-50/50 transition-colors">
                                <td class="px-6 py-5">
                                    <div class="text-sm font-bold text-zinc-800 group-hover:text-black">{row.namaLengkap}</div>
                                    <div class="text-[10px] text-zinc-400 md:hidden">{row.namaBidang ?? '-'}</div>
                                </td>
                                <td class="px-6 py-5 text-xs text-zinc-500 hidden md:table-cell font-medium">{row.namaBidang ?? '-'}</td>
                                <td class="px-6 py-5 text-sm font-bold text-zinc-900 text-right tabular-nums">{row.totalLaporan}</td>
                                <td class="px-6 py-5 text-xs text-zinc-500 text-right hidden sm:table-cell tabular-nums">
                                    {Number(row.totalPeserta).toLocaleString('id-ID')}
                                </td>
                                <td class="px-6 py-5 hidden lg:table-cell">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <div title="Disetujui" class="w-8 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold text-center border border-emerald-100">{row.totalDisetujui}</div>
                                        <div title="Pending" class="w-8 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold text-center border border-amber-100">{row.totalMenunggu}</div>
                                        <div title="Revisi" class="w-8 py-1 rounded bg-orange-50 text-orange-600 text-[10px] font-bold text-center border border-orange-100">{row.totalRevisi}</div>
                                        <div title="Ditolak" class="w-8 py-1 rounded bg-rose-50 text-rose-600 text-[10px] font-bold text-center border border-rose-100">{row.totalDitolak}</div>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>