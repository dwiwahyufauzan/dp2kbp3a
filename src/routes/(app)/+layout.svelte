<script lang="ts">
    import { goto } from '$app/navigation';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import Toast from '$lib/components/Toast.svelte';
    import { fade } from 'svelte/transition';
    import type { LayoutData } from './$types';
    import { Search, Bell, Menu, PanelLeftClose, PanelLeft, Zap, X } from 'lucide-svelte';

    let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

    let sidebarOpen = $state(false);
    let sidebarCollapsed = $state(false);
    let searchQuery = $state('');
    let showNotif = $state(false);

    const initials = $derived(
        (data.user?.namaLengkap ?? '')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    );

    const roleLabel = $derived(() => {
        const r = data.user?.namaRole;
        if (r === 'admin') return 'Administrator';
        if (r === 'kepala_bidang') return 'Kepala Bidang';
        if (r === 'petugas') return 'Petugas Lapangan';
        if (r === 'pimpinan') return 'Pimpinan';
        return r ?? '';
    });

    function handleSearch(e: KeyboardEvent) {
        if (e.key === 'Enter' && searchQuery.trim()) {
            goto(`/laporan?search=${encodeURIComponent(searchQuery.trim())}`);
            searchQuery = '';
        }
    }

    async function markRead(idNotif: string, href: string) {
        showNotif = false;
        try {
            await fetch(`/api/notifikasi/${idNotif}/read`, { method: 'PATCH' });
        } catch { /* abaikan */ }
        goto(href);
    }
</script>

<div class="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden selection:bg-zinc-900 selection:text-white">
    
    {#if sidebarOpen}
        <div
            transition:fade={{ duration: 200 }}
            class="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-40 lg:hidden"
            role="button"
            tabindex="-1"
            onclick={() => (sidebarOpen = false)}
            onkeydown={() => {}}
        ></div>
    {/if}

    <div class="relative hidden lg:flex shrink-0 flex-col transition-[width] duration-300 ease-in-out z-20 {sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'} border-r border-zinc-200 shadow-sm">
        <Sidebar user={data.user!} pendingCount={data.pendingCount ?? 0} revisiCount={data.revisiCount ?? 0} collapsed={sidebarCollapsed} />
    </div>

    <!-- Mobile Sidebar -->
    <aside
        class="fixed inset-y-0 left-0 z-50 w-[260px] bg-zinc-950 lg:hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <Sidebar user={data.user!} pendingCount={data.pendingCount ?? 0} revisiCount={data.revisiCount ?? 0} onClose={() => (sidebarOpen = false)} />
    </aside>

    <div class="flex-1 flex flex-col min-w-0 relative w-full bg-white">
        
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between border-b border-zinc-100">
            <div class="flex items-center gap-3 sm:gap-6">
                <!-- Mobile Menu & Collapse Toggle -->
                <button
                    onclick={() => (sidebarOpen = true)}
                    class="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                    <Menu class="w-5 h-5" />
                </button>
                <button
                    onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
                    class="hidden lg:flex p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                    {#if sidebarCollapsed}
                        <PanelLeft class="w-4 h-4" />
                    {:else}
                        <PanelLeftClose class="w-4 h-4" />
                    {/if}
                </button>

                <div class="hidden md:flex items-center bg-zinc-50 rounded-xl px-3.5 py-2 w-64 lg:w-80 focus-within:ring-1 focus-within:ring-zinc-900 focus-within:bg-white transition-all border border-zinc-200/50">
                    <Search class="w-4 h-4 text-zinc-400 shrink-0" />
                    <input 
                        type="text" 
                        bind:value={searchQuery}
                        onkeydown={handleSearch}
                        placeholder="Cari data laporan..." 
                        class="bg-transparent border-none outline-none text-sm font-medium text-zinc-800 ml-2.5 w-full placeholder:text-zinc-400" 
                    />
                    {#if searchQuery}
                        <button
                            type="button"
                            onclick={() => searchQuery = ''}
                            class="shrink-0 ml-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                            aria-label="Hapus pencarian"
                        >
                            <X class="w-3.5 h-3.5" />
                        </button>
                    {/if}
                </div>
            </div>

            <div class="flex items-center gap-3">
                <div class="relative">
                    <button 
                        onclick={() => showNotif = !showNotif}
                        onblur={() => setTimeout(() => showNotif = false, 300)}
                        class="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative"
                    >
                        <Bell class="w-5 h-5" />
                        {#if data.unreadNotif > 0}
                            <span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-rose-500 rounded-full border border-white flex items-center justify-center">
                                <span class="text-[9px] font-black text-white px-0.5">{data.unreadNotif > 9 ? '9+' : data.unreadNotif}</span>
                            </span>
                        {/if}
                    </button>

                    {#if showNotif}
                        <div transition:fade={{duration: 150}} class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden text-left">
                            <div class="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                                <h3 class="text-xs font-bold uppercase tracking-widest text-zinc-500">Notifikasi</h3>
                                {#if data.unreadNotif > 0}
                                    <form method="POST" action="/api/notifikasi-read-all">
                                        <button type="submit" class="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-widest transition-colors">Tandai Semua</button>
                                    </form>
                                {/if}
                            </div>
                            <div class="max-h-[60vh] overflow-y-auto">
                                {#if data.notifikasi && data.notifikasi.length > 0}
                                    {#each data.notifikasi as notif (notif.idNotif)}
                                        {@const tipeColor = notif.tipe === 'disetujui' ? 'text-emerald-500 bg-emerald-50' : notif.tipe === 'ditolak' ? 'text-rose-500 bg-rose-50' : notif.tipe === 'revisi' ? 'text-amber-500 bg-amber-50' : 'text-zinc-500 bg-zinc-100'}
                                        <button
                                            type="button"
                                            onclick={() => markRead(notif.idNotif, notif.idReferensi ? `/laporan/${notif.idReferensi}` : '/dashboard')}
                                            class="w-full text-left flex items-start gap-3 p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 {notif.isRead === 0 ? 'bg-blue-50/30' : ''}"
                                        >
                                            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {tipeColor}">
                                                <Zap class="w-3.5 h-3.5" />
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <p class="text-xs font-bold text-zinc-900 truncate">{notif.judul}</p>
                                                    {#if notif.isRead === 0}
                                                        <span class="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    {/if}
                                                </div>
                                                <p class="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{notif.pesan}</p>
                                                <p class="text-[10px] text-zinc-400 mt-1">{new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </button>
                                    {/each}
                                {:else}
                                    <div class="p-8 text-center">
                                        <Bell class="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                                        <p class="text-sm text-zinc-500 font-medium">Tidak ada notifikasi.</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="hidden sm:block w-px h-6 bg-zinc-200 mx-2"></div>

                <a
                    href="/profil"
                    class="flex items-center gap-3 hover:bg-zinc-50 rounded-xl px-2 py-1.5 transition-colors group"
                >
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-bold text-zinc-900 leading-none">{data.user?.namaLengkap}</p>
                        <p class="text-[10px] text-zinc-500 font-medium mt-1">{roleLabel()}</p>
                    </div>
                    <div class="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-zinc-700 transition-colors">
                        {initials}
                    </div>
                </a>
            </div>
        </header>

        <!-- Main Workspace Area -->
        <main class="flex-1 overflow-y-auto bg-white custom-scrollbar w-full">
            {@render children()}
        </main>
    </div>
</div>

<Toast />

<style>
    /* Minimal Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e4e4e7;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #d4d4d8;
    }
</style>