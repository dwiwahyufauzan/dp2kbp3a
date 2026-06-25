<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';
    import type { Bidang } from '$lib/types';
    import { LayoutGrid, Plus, CheckCircle2, FileX2, Edit2, X } from 'lucide-svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    const bidang = $derived(data.bidang as Bidang[]);

    let showCreate = $state(false);
    let editItem = $state<Bidang | null>(null);
    let loading = $state(false);
    let confirmOpen = $state(false);
    let confirmMsg = $state('');
    let confirmType = $state<'danger' | 'warning' | 'success' | 'info'>('danger');
    let confirmTitle = $state('');
    let confirmLabel = $state('');
    let isConfirmed = false;
    let modalFormEl = $state<HTMLFormElement | null>(null);
    let pendingForm = $state<HTMLFormElement | null>(null);

    $effect(() => {
        if (form?.createSuccess || form?.updateSuccess || form?.deleteSuccess) {
            showCreate = false;
            editItem = null;
        }
    });
</script>

<svelte:head><title>Bidang — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <LayoutGrid class="w-3 h-3" /> Data Master
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                Manajemen Bidang
            </h1>
            <p class="text-zinc-500 mt-1 font-light">{bidang.length} bidang terdaftar di sistem.</p>
        </div>
        <button
            onclick={() => { showCreate = true; editItem = null; }}
            class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200"
        >
            <Plus class="w-4 h-4" /> Tambah Bidang
        </button>
    </header>

    {#if form?.createSuccess || form?.updateSuccess || form?.deleteSuccess}
        <div class="p-4 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            {form?.deleteSuccess ? 'Bidang berhasil dihapus.' : form?.updateSuccess ? 'Bidang berhasil diperbarui.' : 'Bidang berhasil ditambahkan.'}
        </div>
    {/if}
    {#if form?.createError || form?.updateError || form?.deleteError}
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
            <FileX2 class="w-5 h-5" />
            {form?.createError ?? form?.updateError ?? form?.deleteError}
        </div>
    {/if}

    <div class="overflow-x-auto rounded-[2rem] border border-zinc-100 bg-white shadow-sm mt-4">
        {#if bidang.length === 0}
            <div class="p-16 text-center flex flex-col items-center justify-center bg-zinc-50/50">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 border border-zinc-200 mb-4">
                    <LayoutGrid class="w-8 h-8" />
                </div>
                <p class="font-bold text-zinc-900 text-lg">Belum ada data bidang</p>
                <p class="text-sm text-zinc-500 mt-1">Tambahkan data pertama Anda.</p>
            </div>
        {:else}
            <table class="min-w-full divide-y divide-zinc-100">
                <thead class="bg-zinc-50/50">
                    <tr>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Nama Bidang</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] hidden sm:table-cell">Deskripsi</th>
                        <th class="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 bg-white">
                    {#each bidang as b}
                        <tr class="hover:bg-zinc-50/80 transition-colors group">
                            <td class="px-6 py-4 text-sm font-bold text-zinc-900">{b.namaBidang}</td>
                            <td class="px-6 py-4 text-xs font-medium text-zinc-500 hidden sm:table-cell">{b.deskripsi ?? '-'}</td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center gap-2 justify-end">
                                    <button onclick={() => (editItem = b)} class="px-3 py-1.5 text-xs font-bold border border-zinc-200 text-zinc-600 bg-white rounded-lg hover:bg-zinc-100 transition-all">Edit</button>
                                    <form method="POST" action="?/delete" use:enhance={() => { return async ({ update }) => { await update() } }}>
                                        <input type="hidden" name="id" value={b.idBidang} />
                                        <button type="button" onclick={(e) => { pendingForm = (e.currentTarget as HTMLElement).closest('form'); confirmMsg = `Hapus bidang "${b.namaBidang}"?`; confirmType = 'danger'; confirmTitle = 'Konfirmasi Hapus'; confirmLabel = 'Ya, Hapus'; confirmOpen = true; }} class="px-3 py-1.5 text-xs font-bold border border-rose-200 text-rose-600 bg-white rounded-lg hover:bg-rose-50 transition-all">Hapus</button>
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
            <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-zinc-100 overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 class="font-extrabold text-zinc-900 text-lg flex items-center gap-2">
                        {#if showCreate} <Plus class="w-5 h-5 text-zinc-400" /> Tambah Bidang {/if}
                        {#if editItem} <Edit2 class="w-5 h-5 text-zinc-400" /> Edit Bidang {/if}
                    </h2>
                    <button onclick={() => { showCreate = false; editItem = null; }} class="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>
                <form
                    bind:this={modalFormEl}
                    method="POST"
                    action={showCreate ? '?/create' : '?/update'}
                    use:enhance={({ cancel }) => {
                        if (!isConfirmed) {
                            cancel();
                            pendingForm = modalFormEl;
                            confirmMsg = showCreate ? 'Apakah Anda yakin ingin menambahkan bidang baru?' : `Apakah Anda yakin ingin menyimpan perubahan bidang "${editItem?.namaBidang}"?`;
                            confirmType = showCreate ? 'success' : 'warning';
                            confirmTitle = showCreate ? 'Konfirmasi Tambah' : 'Konfirmasi Ubah';
                            confirmLabel = showCreate ? 'Ya, Tambah' : 'Ya, Simpan';
                            confirmOpen = true;
                            return;
                        }
                        loading = true;
                        return async ({ update }) => {
                            await update();
                            loading = false;
                            isConfirmed = false;
                        };
                    }}
                    class="p-6 space-y-5"
                >
                    {#if editItem}<input type="hidden" name="id" value={editItem.idBidang} />{/if}
                    
                    <div>
                        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nama Bidang {showCreate ? '*' : ''}</label>
                        <input name="namaBidang" type="text" required={showCreate} value={editItem?.namaBidang ?? ''} placeholder="Contoh: Bidang KB" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Deskripsi</label>
                        <textarea name="deskripsi" rows="3" class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all resize-y">{editItem?.deskripsi ?? ''}</textarea>
                    </div>

                    <div class="flex items-center gap-3 pt-4 border-t border-zinc-100">
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
    title={confirmTitle}
    message={confirmMsg}
    type={confirmType}
    confirmLabel={confirmLabel}
    onConfirm={() => {
        confirmOpen = false;
        isConfirmed = true;
        pendingForm?.requestSubmit();
    }}
    onCancel={() => {
        confirmOpen = false;
        pendingForm = null;
        isConfirmed = false;
    }}
/>