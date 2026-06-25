<script lang="ts">
    import { page } from '$app/stores';
    import type { NamaRole } from '$lib/types';
    import { LayoutDashboard, FileSpreadsheet, Layers, LineChart, Users, Grid2X2, List, LogOut, ShieldCheck, ClipboardEdit } from 'lucide-svelte';
    import logo from '$lib/assets/logo.jpeg';

    let {
        user,
        permissions = [],
        pendingCount = 0,
        revisiCount = 0,
        collapsed = false,
        onClose,
        onToggle
    }: {
        user: { namaLengkap: string; namaRole: string; email: string }
        permissions?: string[]
        pendingCount?: number
        revisiCount?: number
        collapsed?: boolean
        onClose?: () => void
        onToggle?: () => void
    } = $props();

    const role = $derived(user.namaRole as NamaRole);
    const currentPath = $derived($page.url.pathname);
    const isActive = (href: string) => currentPath === href || (href !== '/dashboard' && currentPath.startsWith(href));

    interface NavItem {
        href: string;
        label: string;
        icon: any;
        roles: NamaRole[];
        permission?: string;
    }

    const navItems: NavItem[] = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan']
        },
        {
            href: '/laporan',
            label: 'Laporan Kegiatan',
            icon: FileSpreadsheet,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan']
        },
        {
            href: '/verifikasi',
            label: 'Verifikasi',
            icon: ShieldCheck,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'verifikasi_laporan'
        },
        {
            href: '/revisi',
            label: 'Revisi Saya',
            icon: ClipboardEdit,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'buat_laporan'
        },
        {
            href: '/rekap',
            label: 'Rekapitulasi',
            icon: Layers,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'rekap_laporan'
        },
        {
            href: '/statistik',
            label: 'Analitik & Tren',
            icon: LineChart,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'lihat_statistik'
        }
    ];

    const adminItems: NavItem[] = [
        {
            href: '/admin/pengguna',
            label: 'Pengguna',
            icon: Users,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'kelola_pengguna'
        },
        {
            href: '/admin/bidang',
            label: 'Bidang',
            icon: Grid2X2,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'kelola_master'
        },
        {
            href: '/admin/jenis-kegiatan',
            label: 'Konfigurasi Jenis',
            icon: List,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'kelola_master'
        },
        {
            href: '/admin/hak-akses',
            label: 'Hak Akses',
            icon: ShieldCheck,
            roles: ['admin', 'petugas', 'kepala_bidang', 'pimpinan'],
            permission: 'kelola_hak_akses'
        }
    ];

    const cleanPermissions = $derived.by(() => {
        let perms = permissions;
        if (typeof perms === 'string') {
            try {
                perms = JSON.parse(perms);
            } catch {
                perms = [];
            }
        }
        if (!Array.isArray(perms) || perms.length === 0) {
            const defaultPermissions: Record<string, string[]> = {
                admin: ['buat_laporan', 'verifikasi_laporan', 'rekap_laporan', 'lihat_statistik', 'kelola_master', 'kelola_pengguna', 'kelola_hak_akses'],
                petugas: ['buat_laporan', 'lihat_statistik'],
                kepala_bidang: ['verifikasi_laporan', 'rekap_laporan', 'lihat_statistik'],
                pimpinan: ['rekap_laporan', 'lihat_statistik']
            };
            return defaultPermissions[role] || [];
        }
        return perms;
    });

    const visibleNav = $derived(
        navItems.filter((item) => {
            const hasRole = item.roles.includes(role);
            if (!hasRole) return false;
            if (item.permission) {
                return role === 'admin' || cleanPermissions.includes(item.permission);
            }
            return true;
        })
    );
    const visibleAdmin = $derived(
        adminItems.filter((item) => {
            const hasRole = item.roles.includes(role);
            if (!hasRole) return false;
            if (item.permission) {
                return role === 'admin' || cleanPermissions.includes(item.permission);
            }
            return true;
        })
    );
    const initials = $derived(user.namaLengkap.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2));

    const roleLabels: Record<NamaRole, string> = {
        admin: 'Administrator',
        petugas: 'Petugas Lapangan',
        kepala_bidang: 'Kepala Bidang',
        pimpinan: 'Pimpinan'
    };
</script>

<div class="flex flex-col h-full max-h-screen bg-zinc-950 text-zinc-300 font-sans border-r border-zinc-900 overflow-hidden">
    <!-- Branding -->
    <div class="px-5 py-6 flex items-center {collapsed ? 'justify-center' : 'justify-between'} border-b border-zinc-900">
        <div class="flex items-center gap-3">
            <div class="relative shrink-0">
                <div class="w-8 h-8 bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center text-zinc-950 shrink-0">
                    <img src={logo} alt="Logo" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950"></div>
            </div>
            {#if !collapsed}
                <div class="min-w-0">
                    <h1 class="text-base font-extrabold tracking-tight text-white leading-none">Console</h1>
                    <p class="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">DP2KBP3A Monitor</p>
                </div>
            {/if}
        </div>
        {#if onClose}
            <button onclick={onClose} class="lg:hidden p-1.5 text-zinc-500 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        {/if}
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        {#if !collapsed}
            <p class="px-2 text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest mb-3">Sistem Utama</p>
        {/if}

        {#each visibleNav as item}
            <a
                href={item.href}
                onclick={onClose}
                title={collapsed ? item.label : undefined}
                class="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 {collapsed ? 'justify-center' : ''} {isActive(item.href)
                    ? 'bg-zinc-800/50 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'}"
            >
                <div class="shrink-0">
                    <svelte:component this={item.icon} class="w-4 h-4 {isActive(item.href) ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}" />
                </div>
                {#if !collapsed}
                    <span class="flex-1">{item.href === '/revisi' && role === 'petugas' ? 'Riwayat Revisian' : item.label}</span>
                    {#if item.href === '/laporan' && pendingCount > 0}
                        <span class="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold font-mono rounded">
                            {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                    {:else if item.href === '/verifikasi' && pendingCount > 0}
                        <span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono rounded">
                            {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                    {:else if item.href === '/revisi' && revisiCount > 0}
                        <span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono rounded">
                            {revisiCount > 99 ? '99+' : revisiCount}
                        </span>
                    {/if}
                {:else if item.href === '/laporan' && pendingCount > 0}
                    <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                {:else if item.href === '/verifikasi' && pendingCount > 0}
                    <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                {:else if item.href === '/revisi' && revisiCount > 0}
                    <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                {/if}
            </a>
        {/each}

        {#if visibleAdmin.length > 0}
            <div class="pt-8 pb-3">
                {#if !collapsed}
                    <p class="px-2 text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Administrasi</p>
                {:else}
                    <div class="w-4 h-px bg-zinc-800 mx-auto"></div>
                {/if}
            </div>
            {#each visibleAdmin as item}
                <a
                    href={item.href}
                    onclick={onClose}
                    title={collapsed ? item.label : undefined}
                    class="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 {collapsed ? 'justify-center' : ''} {isActive(item.href)
                        ? 'bg-zinc-800/50 text-white'
                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'}"
                >
                    <svelte:component this={item.icon} class="w-4 h-4 shrink-0 transition-transform {isActive(item.href) ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}" />
                    {#if !collapsed}
                        <span>{item.label}</span>
                    {/if}
                </a>
            {/each}
        {/if}
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-zinc-900 bg-zinc-950/50">
        {#if collapsed}
            <div class="flex flex-col items-center gap-4">
                <div class="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0" title={user.namaLengkap}>
                    {initials}
                </div>
                <form action="/logout" method="POST">
                    <button type="submit" class="p-2 text-zinc-500 hover:text-rose-400 transition-colors" title="Logout">
                        <LogOut class="w-4 h-4" />
                    </button>
                </form>
            </div>
        {:else}
            <div class="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <div class="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                    {initials}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-zinc-200 truncate">{user.namaLengkap}</p>
                    <p class="text-[10px] text-zinc-500 truncate mt-0.5">{roleLabels[role] ?? role}</p>
                </div>
                <form action="/logout" method="POST">
                    <button type="submit" aria-label="Logout" class="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <LogOut class="w-4 h-4" />
                    </button>
                </form>
            </div>
        {/if}
    </div>
</div>