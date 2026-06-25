<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';
    import type { Pengguna, Role, Bidang } from '$lib/types';
    import { Users, Plus, Search, CheckCircle2, FileX2, User, X, Eye, EyeOff, RotateCcw } from 'lucide-svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const pengguna = $derived(data.pengguna as Pengguna[]);
    const roles = $derived(data.roles as Role[]);
    const bidang = $derived(data.bidang as Bidang[]);

    let showCreate = $state(false);
    let editItem = $state<Pengguna | null>(null);
    let loading = $state(false);
    let searchQ = $state('');
    let filterRole = $state('');
    let filterBidang = $state('');
    let filterKecamatan = $state('');
    let confirmOpen = $state(false);
    let confirmMsg = $state('');
    let confirmType = $state<'danger' | 'warning' | 'success' | 'info'>('danger');
    let confirmTitle = $state('');
    let confirmLabel = $state('');
    let isConfirmed = false;
    let modalFormEl = $state<HTMLFormElement | null>(null);
    let pendingForm = $state<HTMLFormElement | null>(null);
    let showPassword = $state(false);

    const filtered = $derived(
        pengguna.filter((p) => {
            const matchesSearch = !searchQ || 
                p.namaLengkap.toLowerCase().includes(searchQ.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQ.toLowerCase());

            const matchesRole = !filterRole || p.namaRole === filterRole;
            const matchesBidang = !filterBidang || p.idBidang === filterBidang;
            const matchesKecamatan = !filterKecamatan || p.namaKecamatan === filterKecamatan;

            return matchesSearch && matchesRole && matchesBidang && matchesKecamatan;
        })
    );

    function resetFilters() {
        searchQ = '';
        filterRole = '';
        filterBidang = '';
        filterKecamatan = '';
    }

    const roleLabels: Record<string, string> = {
        admin: 'Administrator',
        petugas: 'Petugas Lapangan',
        kepala_bidang: 'Kepala Bidang',
        pimpinan: 'Pimpinan'
    };

    let kecamatanList = $state<{ id: string; name: string }[]>([]);
    let loadingKec = $state(true);

    $effect(() => {
        fetch('/api/wilayah/kecamatan/3213')
            .then((r) => r.json())
            .then((d) => {
                kecamatanList = d.map((k: { id: string; name: string }) => ({
                    id: k.id,
                    name: toTitle(k.name)
                })).sort((a: any, b: any) => a.name.localeCompare(b.name));
            })
            .catch(() => { kecamatanList = []; })
            .finally(() => { loadingKec = false; });
    });

    function toTitle(s: string) {
        return s.toLowerCase().replace(/(^\w|\s\w)/g, (c) => c.toUpperCase());
    }

    let selectedKecamatan = $state('');
    let selectedRole = $state('');
    let selectedBidang = $state('');

    $effect(() => {
        if (editItem) {
            selectedKecamatan = editItem.namaKecamatan ?? '';
            selectedRole = editItem.idRole ?? '';
            selectedBidang = editItem.idBidang ?? '';
        } else {
            selectedKecamatan = '';
            selectedRole = '';
            selectedBidang = '';
        }
    });

    $effect(() => {
        if (form?.createSuccess || form?.updateSuccess || form?.deleteSuccess) {
            showCreate = false;
            editItem = null;
            showPassword = false;
        }
    });
</script>

<svelte:head><title>Pengguna — Console</title></svelte:head>

<div class="max-w-[1400px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <!-- HEADER -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
        <div>
            <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <Users class="w-3 h-3" /> Data Master
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                Data Pengguna
            </h1>
            <p class="text-zinc-500 mt-1 font-light">{pengguna.length} pengguna terdaftar di sistem.</p>
        </div>

        <button
            onclick={() => { showCreate = true; editItem = null; }}
            class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200"
        >
            <Plus class="w-4 h-4" /> Tambah Pengguna
        </button>
    </header>

    <!-- ALERTS -->
    {#if form?.createSuccess || form?.updateSuccess || form?.deleteSuccess}
        <div class="p-4 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            {form?.deleteSuccess ? 'Pengguna berhasil dihapus.' : form?.updateSuccess ? 'Pengguna berhasil diperbarui.' : 'Pengguna berhasil ditambahkan.'}
        </div>
    {/if}
    {#if form?.createError || form?.updateError || form?.deleteError}
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
            <FileX2 class="w-5 h-5" />
            {form?.createError ?? form?.updateError ?? form?.deleteError}
        </div>
    {/if}

    <!-- SEARCH & FILTERS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center py-4">
        <!-- Search bar -->
        <div class="lg:col-span-4 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Search class="w-4 h-4" />
            </div>
            <input
                type="text"
                placeholder="Cari nama atau email pengguna..."
                bind:value={searchQ}
                class="w-full pl-10 {searchQ ? 'pr-9' : 'pr-4'} py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium text-zinc-800 placeholder:text-zinc-400"
            />
            {#if searchQ}
                <button
                    type="button"
                    onclick={() => searchQ = ''}
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                    aria-label="Hapus pencarian"
                >
                    <X class="w-3.5 h-3.5" />
                </button>
            {/if}
        </div>

        <!-- Filter Role -->
        <div class="lg:col-span-2">
            <select
                bind:value={filterRole}
                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                aria-label="Filter Role"
            >
                <option value="">Semua Role</option>
                {#each roles as r}
                    <option value={r.namaRole}>{roleLabels[r.namaRole] ?? r.namaRole}</option>
                {/each}
            </select>
        </div>

        <!-- Filter Bidang -->
        <div class="lg:col-span-2">
            <select
                bind:value={filterBidang}
                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                aria-label="Filter Bidang"
            >
                <option value="">Semua Bidang</option>
                {#each bidang as b}
                    <option value={b.idBidang}>{b.namaBidang}</option>
                {/each}
            </select>
        </div>

        <!-- Filter Kecamatan -->
        <div class="lg:col-span-2">
            <select
                bind:value={filterKecamatan}
                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                aria-label="Filter Kecamatan"
            >
                <option value="">Semua Kecamatan</option>
                {#each kecamatanList as k}
                    <option value={k.name}>{k.name}</option>
                {/each}
            </select>
        </div>

        <!-- Reset Filter -->
        <div class="lg:col-span-2">
            <button
                type="button"
                onclick={resetFilters}
                disabled={!searchQ && !filterRole && !filterBidang && !filterKecamatan}
                class="w-full px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <RotateCcw class="w-4 h-4" /> Reset Filter
            </button>
        </div>
    </div>

    <!-- TABLE -->
    <div class="overflow-x-auto rounded-[2rem] border border-zinc-100 bg-white shadow-sm">
        {#if filtered.length === 0}
            <div class="p-16 text-center flex flex-col items-center justify-center bg-zinc-50/50">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-zinc-300 border border-zinc-200 mb-4">
                    <User class="w-8 h-8" />
                </div>
                <p class="font-bold text-zinc-900 text-lg">Pengguna tidak ditemukan</p>
                <p class="text-sm text-zinc-500 mt-1">Coba sesuaikan kata kunci pencarian.</p>
            </div>
        {:else}
            <table class="min-w-full divide-y divide-zinc-100">
                <thead class="bg-zinc-50/50">
                    <tr>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Nama & Email</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Role</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] hidden md:table-cell">Bidang</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] hidden md:table-cell">Lokasi Tugas</th>
                        <th class="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] hidden lg:table-cell">Status</th>
                        <th class="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-50 bg-white">
                    {#each filtered as p}
                        <tr class="hover:bg-zinc-50/80 transition-colors group">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                        {p.namaLengkap.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-zinc-900">{p.namaLengkap}</p>
                                        <p class="text-[10px] font-medium text-zinc-500">{p.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-zinc-100 text-zinc-600 uppercase tracking-widest">{roleLabels[p.namaRole] ?? p.namaRole}</span>
                            </td>
                            <td class="px-6 py-4 text-xs font-semibold text-zinc-600 hidden md:table-cell">{p.namaBidang ?? '-'}</td>
                            <td class="px-6 py-4 text-xs font-semibold text-zinc-600 hidden md:table-cell">{p.namaKecamatan ?? '-'}</td>
                            <td class="px-6 py-4 hidden lg:table-cell">
                                {#if p.statusAktif === 'y'}
                                    <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Aktif</span>
                                {:else}
                                    <span class="flex items-center gap-1.5 text-xs font-bold text-rose-600"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Nonaktif</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button onclick={() => (editItem = p)} class="px-3 py-1.5 text-xs font-bold border border-zinc-200 bg-white text-zinc-600 rounded-lg hover:bg-zinc-100 transition-all">Edit</button>
                                    <form method="POST" action="?/delete" use:enhance={() => { return async ({ update }) => { await update() } }}>
                                        <input type="hidden" name="id" value={p.idUser} />
                                        <button type="button" onclick={(e) => { pendingForm = (e.currentTarget as HTMLElement).closest('form'); confirmMsg = `Hapus pengguna "${p.namaLengkap}"?`; confirmType = 'danger'; confirmTitle = 'Konfirmasi Hapus'; confirmLabel = 'Ya, Hapus'; confirmOpen = true; }} class="px-3 py-1.5 text-xs font-bold border border-rose-200 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-all">Hapus</button>
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
            <div class="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-zinc-100 overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 class="font-extrabold text-zinc-900 text-lg flex items-center gap-2">
                        {#if showCreate} <Plus class="w-5 h-5 text-zinc-400" /> Tambah Pengguna {/if}
                        {#if editItem} <User class="w-5 h-5 text-zinc-400" /> Edit Pengguna {/if}
                    </h2>
                    <button onclick={() => { showCreate = false; editItem = null; showPassword = false; }} class="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>
                <!-- Combined Form Logic -->
                <form
                    bind:this={modalFormEl}
                    method="POST"
                    action={showCreate ? '?/create' : '?/update'}
                    use:enhance={({ cancel }) => {
                        if (!isConfirmed) {
                            cancel();
                            pendingForm = modalFormEl;
                            confirmMsg = showCreate ? 'Apakah Anda yakin ingin menambahkan pengguna baru?' : `Apakah Anda yakin ingin menyimpan perubahan pengguna "${editItem?.namaLengkap}"?`;
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
                    class="p-6 space-y-4"
                >
                    {#if editItem}<input type="hidden" name="id" value={editItem.idUser} />{/if}
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nama Lengkap {showCreate ? '*' : ''}</label>
                            <input name="namaLengkap" type="text" required={showCreate} value={editItem?.namaLengkap ?? ''} class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email {showCreate ? '*' : ''}</label>
                            <input name="email" type="email" required={showCreate} value={editItem?.email ?? ''} class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Role {showCreate ? '*' : ''}</label>
                            <select name="idRole" required={showCreate} bind:value={selectedRole} class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer">
                                {#if showCreate}<option value="">-- Pilih Role --</option>{/if}
                                {#each roles as r}
                                    <option value={r.idRole}>{roleLabels[r.namaRole] ?? r.namaRole}</option>
                                  {/each}
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Bidang</label>
                            <select name="idBidang" bind:value={selectedBidang} class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer">
                                <option value="">-- Tidak Ada --</option>
                                {#each bidang as b}
                                    <option value={b.idBidang}>{b.namaBidang}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Password {showCreate ? '*' : '(opsional)'}</label>
                            <div class="relative">
                                <input 
                                    name="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    required={showCreate} 
                                    minlength="8" 
                                    placeholder={showCreate ? "Min. 8 karakter" : "••••••••"} 
                                    class="w-full px-4 py-2.5 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400" 
                                />
                                <button
                                    type="button"
                                    onclick={() => showPassword = !showPassword}
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                                    aria-label="Toggle password"
                                >
                                    {#if showPassword}
                                        <EyeOff class="w-4 h-4" />
                                    {:else}
                                        <Eye class="w-4 h-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="namaKecamatan" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Lokasi Tugas (Kecamatan)</label>
                            <select id="namaKecamatan" name="namaKecamatan" bind:value={selectedKecamatan} class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer">
                                <option value="">-- Tidak Ada / Umum --</option>
                                {#each kecamatanList as k}
                                    <option value={k.name}>{k.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    {#if !showCreate}
                        <div>
                            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Status Aktif</label>
                            <select name="statusAktif" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer">
                                <option value="y" selected={editItem?.statusAktif === 'y'}>Aktif</option>
                                <option value="n" selected={editItem?.statusAktif === 'n'}>Nonaktif</option>
                            </select>
                        </div>
                    {/if}

                    <div class="flex items-center gap-3 pt-4 border-t border-zinc-100">
                        <button type="button" onclick={() => { showCreate = false; editItem = null; showPassword = false; }} class="px-5 py-2.5 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors">Batal</button>
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