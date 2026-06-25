<script lang="ts">
    import { goto } from '$app/navigation';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import type { PageData } from './$types';
    import type { LaporanItem } from '$lib/types';
    import { FileText, Search, Filter, Plus, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();

    const laporan = $derived(data.laporan as LaporanItem[]);

    let searchInput = $state(data.search ?? '');
    let statusFilter = $state(data.status ?? '');
    let idBidangFilter = $state(data.user?.namaRole === 'kepala_bidang' ? (data.user?.idBidang ?? '') : (data.idBidang ?? ''));
    let idJenisFilter = $state(data.idJenis ?? '');

    const filteredKegiatanOptions = $derived.by(() => {
        const allKegiatan = data.jenisKegiatan ?? [];
        if (!idBidangFilter) return allKegiatan;
        return allKegiatan.filter(k => k.idBidang === idBidangFilter);
    });

    $effect(() => {
        if (idBidangFilter) {
            const hasMatch = filteredKegiatanOptions.some(k => k.idJenis === idJenisFilter);
            if (!hasMatch) {
                idJenisFilter = '';
            }
        }
    });

    function applyFilter() {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        if (searchInput.trim()) params.set('search', searchInput.trim());
        if (idBidangFilter) params.set('idBidang', idBidangFilter);
        if (idJenisFilter) params.set('idJenis', idJenisFilter);
        params.set('page', '1');
        goto(`/laporan?${params.toString()}`);
    }

    function resetFilter() {
        searchInput = '';
        statusFilter = '';
        idBidangFilter = data.user?.namaRole === 'kepala_bidang' ? (data.user?.idBidang ?? '') : '';
        idJenisFilter = '';
        goto('/laporan');
    }

    function goToPage(p: number) {
        const params = new URLSearchParams();
        if (data.status) params.set('status', data.status);
        if (data.search) params.set('search', data.search);
        if (data.idBidang) params.set('idBidang', data.idBidang);
        if (data.idJenis) params.set('idJenis', data.idJenis);
        params.set('page', String(p));
        goto(`/laporan?${params.toString()}`);
    }

    function formatTanggal(tgl: string) {
        return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const statusOptions = ['', 'Pending', 'Disetujui', 'Ditolak', 'Revisi'];

    const currentPage  = $derived(data.page ?? 1);
    const totalPages   = $derived(data.totalPages ?? 1);
    const total        = $derived(data.total ?? 0);
</script>

<svelte:head><title>Laporan Kegiatan — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <!-- HEADER -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <FileText class="w-3 h-3" /> Daftar Laporan
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                Semua Kegiatan
            </h1>
            <p class="text-zinc-500 mt-1 font-light">{total} laporan ditemukan secara keseluruhan.</p>
        </div>

        {#if data.user?.namaRole === 'admin' || (data.profil?.permissions || []).includes('buat_laporan')}
            <a href="/laporan/buat" class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200">
                <Plus class="w-4 h-4" /> Buat Laporan
            </a>
        {/if}
    </header>

    <!-- FILTER -->
    <div class="space-y-3 py-4">
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Search class="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="Cari lokasi, deskripsi..."
                    bind:value={searchInput}
                    onkeydown={(e) => e.key === 'Enter' && applyFilter()}
                    class="w-full pl-10 {searchInput ? 'pr-9' : 'pr-4'} py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium text-zinc-800 placeholder:text-zinc-400"
                />
                {#if searchInput}
                    <button
                        type="button"
                        onclick={() => { searchInput = ''; applyFilter(); }}
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                        aria-label="Hapus pencarian"
                    >
                        <X class="w-3.5 h-3.5" />
                    </button>
                {/if}
            </div>
            <select
                bind:value={statusFilter}
                class="px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer min-w-[160px]"
            >
                {#each statusOptions as opt}
                    <option value={opt}>{opt || 'Semua Status'}</option>
                {/each}
            </select>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
            {#if data.user?.namaRole !== 'kepala_bidang'}
                <select
                    bind:value={idBidangFilter}
                    class="flex-1 px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                >
                    <option value="">-- Semua Bidang --</option>
                    {#each (data.bidangList ?? []) as b}
                        <option value={b.idBidang}>{b.namaBidang}</option>
                    {/each}
                </select>
            {/if}
            <select
                bind:value={idJenisFilter}
                disabled={!!idBidangFilter && filteredKegiatanOptions.length === 0}
                class="flex-1 px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
            >
                <option value="">-- Semua Kegiatan --</option>
                {#each filteredKegiatanOptions as opt}
                    <option value={opt.idJenis}>{opt.namaKegiatan}</option>
                {/each}
            </select>
            <button
                onclick={applyFilter}
                class="px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2"
            >
                <Filter class="w-4 h-4" /> Terapkan Filter
            </button>
            <button
                onclick={resetFilter}
                disabled={!searchInput && !statusFilter && !idBidangFilter && !idJenisFilter}
                class="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
                <RotateCcw class="w-4 h-4" /> Reset
            </button>
        </div>
    </div>

    <!-- TABLE -->
    <div>
        {#if laporan.length === 0}
            <div class="p-16 text-center flex flex-col items-center justify-center bg-zinc-50/50 rounded-[2rem] border border-zinc-100">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 border border-zinc-200 mb-4">
                    <FileText class="w-8 h-8" />
                </div>
                <p class="font-bold text-zinc-900 text-lg">Belum ada data laporan</p>
                <p class="text-sm text-zinc-500 mt-1">Coba sesuaikan filter atau tambahkan laporan baru.</p>
            </div>
        {:else}
            <div class="overflow-x-auto rounded-[2rem] border border-zinc-100 bg-white shadow-sm">
                <table class="min-w-full divide-y divide-zinc-100">
                    <thead class="bg-zinc-50/50">
                        <tr>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Tanggal</th>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Kegiatan & Bidang</th>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Petugas</th>
                            <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Status</th>
                            <th class="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-50 bg-white">
                        {#each laporan as item}
                            {@const isPending = item.statusVerifikasi === 'Pending'}
                            {@const isApproved = item.statusVerifikasi === 'Disetujui'}
                            {@const isRejected = item.statusVerifikasi === 'Ditolak'}
                            {@const isRevisi = item.statusVerifikasi === 'Revisi'}
                            <tr class="transition-colors group relative {isPending ? 'bg-amber-50/60 hover:bg-amber-50 border-l-2 border-l-amber-400' : isApproved ? 'hover:bg-emerald-50/30' : isRejected ? 'hover:bg-rose-50/30' : isRevisi ? 'hover:bg-blue-50/30' : 'hover:bg-zinc-50/80'}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 {isPending ? 'bg-amber-100 text-amber-700' : isApproved ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-rose-100 text-rose-700' : isRevisi ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-700'}">
                                            {new Date(item.tanggalKegiatan).getDate()}
                                        </div>
                                        <div>
                                            <span class="text-xs font-semibold text-zinc-700 block">{formatTanggal(item.tanggalKegiatan)}</span>
                                            {#if isPending}
                                                <span class="text-[9px] font-black uppercase tracking-widest text-amber-600">● Baru</span>
                                            {/if}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-xs font-bold text-zinc-850 block truncate max-w-[280px]">{item.namaKegiatan ?? '-'}</span>
                                    <span class="text-[9px] text-zinc-400 font-medium block truncate max-w-[280px]">{item.namaBidang ?? 'Semua Bidang'}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                            {item.namaLengkap?.charAt(0) ?? '?'}
                                        </div>
                                        <span class="text-xs font-semibold text-zinc-700">{item.namaLengkap ?? '-'}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4"><StatusBadge status={item.statusVerifikasi} /></td>
                                <td class="px-6 py-4 text-right">
                                    <a
                                        href="/laporan/{item.idLaporan}"
                                        class="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl transition-all {isPending ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200' : isApproved ? 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50' : isRejected ? 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50' : isRevisi ? 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50' : 'bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300'}"
                                    >Detail</a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
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
                                class="w-8 h-8 text-xs font-bold rounded-lg transition-all {p === currentPage
                                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900'
                                    : 'text-zinc-500 hover:bg-white hover:text-zinc-900'}"
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
</div>