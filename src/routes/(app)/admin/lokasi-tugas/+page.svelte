<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import WilayahSelect from '$lib/components/WilayahSelect.svelte';
    import type { ActionData, PageData } from './$types';
    import type { LokasiTugas } from '$lib/types';
    import { MapPin, Plus, CheckCircle2, FileX2, Edit2, X, Filter, RotateCcw } from 'lucide-svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    const lokasi = $derived(data.lokasi as LokasiTugas[]);

    let showCreate = $state(false);
    let editItem = $state<LokasiTugas | null>(null);
    let loading = $state(false);
    let filterKec = $state(data.kecamatan ?? '');

    let createKey = $state(0);
    let editKey = $state(0);

    let confirmOpen = $state(false);
    let confirmMsg = $state('');
    let pendingForm = $state<HTMLFormElement | null>(null);

    $effect(() => {
        if (form?.createSuccess || form?.updateSuccess || form?.deleteSuccess) {
            showCreate = false;
            editItem = null;
        }
    });

    const kecamatanList = $derived([...new Set(lokasi.map((l) => l.namaKecamatan))].sort());
</script>

<svelte:head><title>Lokasi Tugas — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <MapPin class="w-3 h-3" /> Data Master
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                Lokasi Tugas
            </h1>
            <p class="text-zinc-500 mt-1 font-light">{lokasi.length} lokasi terdaftar di sistem.</p>
        </div>
        <button
            onclick={() => { showCreate = true; editItem = null; createKey++; }}
            class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200"
        >
            <Plus class="w-4 h-4" /> Tambah Lokasi
        </button>
    </header>

    {#if form?.createSuccess || form?.updateSuccess || form?.deleteSuccess}
        <div class="p-4 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            Lokasi berhasil {form?.deleteSuccess ? 'dihapus.' : form?.updateSuccess ? 'diperbarui.' : 'ditambahkan.'}
        </div>
    {/if}
    {#if form?.createError || form?.updateError || form?.deleteError}
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
            <FileX2 class="w-5 h-5" />
            {form?.createError ?? form?.updateError ?? form?.deleteError}
        </div>
    {/if}

    <div class="flex flex-col sm:flex-row items-end gap-3 py-4">
        <div>
            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Filter Kecamatan</label>
            <select
                bind:value={filterKec}
                onchange={() => goto(filterKec ? `/admin/lokasi-tugas?kecamatan=${encodeURIComponent(filterKec)}` : '/admin/lokasi-tugas')}
                class="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer min-w-[200px]"
            >
                <option value="">Semua Kecamatan</option>
                {#each kecamatanList as k}
                    <option value={k}>{k}</option>
                {/each}
            </select>
        </div>
        <button
            onclick={() => { filterKec = ''; goto('/admin/lokasi-tugas'); }}
            disabled={!filterKec}
            class="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 h-[42px]"
        >
            <RotateCcw class="w-4 h-4" /> Reset Filter
        </button>
    </div>

    <div class="overflow-x-auto rounded-[2rem] border border-zinc-100 bg-white shadow-sm mt-4">
        {#if lokasi.length === 0}
            <div class="p-16 text-center flex flex-col items-center justify-center bg-zinc-50/50">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 border border-zinc-200 mb-4">
                    <MapPin class="w-8 h-8" />
                </div>
                <p class="font-bold text-zinc-900 text-lg">Belum ada lokasi tugas</p>
                <p class="text-sm text-zinc-500 mt-1">{filterKec ? `Tidak ada lokasi di kecamatan ${filterKec}` : 'Tambahkan data pertama Anda.'}</p>
            </div>
        {:else}
            <table class="min-w-full divide-y divide-zinc-100">
                <thead class="bg-zinc-50/50">
                    <tr>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Kecamatan</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Desa / Kelurahan</th>
                        <th class="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 bg-white">
                    {#each lokasi as l}
                        <tr class="hover:bg-zinc-50/80 transition-colors group">
                            <td class="px-6 py-4 text-xs font-medium text-zinc-500">{l.namaKecamatan}</td>
                            <td class="px-6 py-4 text-sm font-bold text-zinc-900">{l.namaDesa}</td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onclick={() => { editItem = l; editKey++; }} class="px-3 py-1.5 text-xs font-bold border border-zinc-200 text-zinc-600 bg-white rounded-lg hover:bg-zinc-100 transition-all">Edit</button>
                                    <form method="POST" action="?/delete" use:enhance={() => { return async ({ update }) => { await update() } }}>
                                        <input type="hidden" name="id" value={l.idLokasi} />
                                        <button type="button" onclick={(e) => { pendingForm = (e.currentTarget as HTMLElement).closest('form'); confirmMsg = `Hapus lokasi "${l.namaKecamatan} - ${l.namaDesa}"?`; confirmOpen = true; }} class="px-3 py-1.5 text-xs font-bold border border-rose-200 text-rose-600 bg-white rounded-lg hover:bg-rose-50 transition-all">Hapus</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

    <!-- MODALS -->
    {#if showCreate || editItem}
        <div class="fixed inset-0 backdrop-blur-sm bg-zinc-900/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-zinc-100 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 class="font-extrabold text-zinc-900 text-lg flex items-center gap-2">
                        {#if showCreate} <Plus class="w-5 h-5 text-zinc-400" /> Tambah Lokasi {/if}
                        {#if editItem} <Edit2 class="w-5 h-5 text-zinc-400" /> Edit Lokasi {/if}
                    </h2>
                    <button onclick={() => { showCreate = false; editItem = null; }} class="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>
                <form
                    method="POST"
                    action={showCreate ? '?/create' : '?/update'}
                    use:enhance={() => {
                        loading = true;
                        return async ({ update }) => { await update(); loading = false; };
                    }}
                    class="p-6 space-y-6"
                >
                    {#if editItem}
                        <input type="hidden" name="id" value={editItem.idLokasi} />
                        <div class="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500 font-medium">
                            <span class="font-bold text-zinc-800">Saat ini:</span> {editItem.namaKecamatan} — {editItem.namaDesa}
                        </div>
                    {/if}
                    
                    <div class="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4">
                        {#if showCreate}
                            {#key createKey}<WilayahSelect mode="lokasi-tugas" kecamatanFieldName="namaKecamatan" desaFieldName="namaDesa" required={true}/>{/key}
                        {:else}
                            {#key editKey}<WilayahSelect mode="lokasi-tugas" kecamatanFieldName="namaKecamatan" desaFieldName="namaDesa" initialKecamatan={editItem?.namaKecamatan} initialDesa={editItem?.namaDesa}/>{/key}
                        {/if}
                    </div>

                    <div class="flex items-center gap-3 pt-2 border-t border-zinc-100">
                        <button type="button" onclick={() => { showCreate = false; editItem = null; }} class="px-5 py-2.5 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">Batal</button>
                        <button type="submit" disabled={loading} class="flex-1 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl shadow-md transition-all">
                            {loading ? 'Memproses...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<ConfirmDialog
    open={confirmOpen}
    message={confirmMsg}
    onConfirm={() => { confirmOpen = false; pendingForm?.requestSubmit(); }}
    onCancel={() => { confirmOpen = false; pendingForm = null; }}
/>