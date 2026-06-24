<script lang="ts">
    import StatusBadge from "$lib/components/StatusBadge.svelte";
    import type { PageData } from "./$types";
    import type { LaporanItem } from "$lib/types";
    import {
        LayoutDashboard,
        FileText,
        Users,
        Activity,
        CheckCircle2,
        Clock,
        AlertCircle,
        XCircle,
        Plus,
        FileSpreadsheet,
        ArrowRight,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    const laporan = $derived(data.laporanTerbaru as LaporanItem[]);

    const greeting = $derived.by(() => {
        const h = new Date().getHours();
        if (h < 11) return "Selamat Pagi";
        if (h < 15) return "Selamat Siang";
        if (h < 18) return "Selamat Sore";
        return "Selamat Malam";
    });

    const todayStr = $derived.by(() =>
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
    );

    const statusMeta = [
        { key: "Disetujui", bar: "bg-emerald-500" },
        { key: "Pending", bar: "bg-amber-400" },
        { key: "Revisi", bar: "bg-orange-500" },
        { key: "Ditolak", bar: "bg-rose-500" },
    ] as const;

    // Donut chart gender
    const C = 251.327; // 2 * π * r(40)
    const totalGender = $derived(
        (data.stats.totalLaki ?? 0) + (data.stats.totalPerempuan ?? 0),
    );
    const lakiArc = $derived(
        totalGender > 0 ? (data.stats.totalLaki / totalGender) * C : 0,
    );
    const prmpnArc = $derived(
        totalGender > 0 ? (data.stats.totalPerempuan / totalGender) * C : 0,
    );
    const lakiPct = $derived(
        totalGender > 0
            ? Math.round((data.stats.totalLaki / totalGender) * 100)
            : 0,
    );
    const prmpnPct = $derived(
        totalGender > 0
            ? Math.round((data.stats.totalPerempuan / totalGender) * 100)
            : 0,
    );
</script>

<svelte:head><title>Dashboard — Console</title></svelte:head>

<div
    class="max-w-350 mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700"
>
    <!-- HEADER & GREETINGS -->
    <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8"
    >
        <div>
            <div
                class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
            >
                <LayoutDashboard class="w-3 h-3" />
                {todayStr}
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
                {greeting}, {data.user?.namaLengkap?.split(" ")[0] ?? "User"}
            </h1>
            <p class="text-zinc-500 mt-1 font-light">
                Selamat datang di Sistem Monitoring Kegiatan Lini Lapangan.
            </p>
        </div>
    </header>

    <!-- KPI CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-4">
            <!-- Total Laporan -->
            <div class="space-y-1">
                <div class="flex items-center gap-2 mb-2">
                    <FileText class="w-4 h-4 text-zinc-400" />
                    <p
                        class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Total Laporan
                    </p>
                </div>
                <p
                    class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono"
                >
                    {data.stats.totalLaporan}
                </p>
            </div>

            <!-- Total Peserta -->
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <div class="flex items-center gap-2 mb-2">
                    <Users class="w-4 h-4 text-zinc-400" />
                    <p
                        class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Total Peserta
                    </p>
                </div>
                <p
                    class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono"
                >
                    {data.stats.totalPeserta.toLocaleString("id-ID")}
                </p>
            </div>

            <!-- Pending -->
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <div class="flex items-center gap-2 mb-2">
                    <Clock class="w-4 h-4 text-amber-500" />
                    <p
                        class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Menunggu
                    </p>
                </div>
                <p
                    class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono"
                >
                    {data.byStatus?.Pending ?? 0}
                </p>
            </div>

            <!-- Disetujui -->
            <div class="space-y-1 border-l border-zinc-100 pl-8">
                <div class="flex items-center gap-2 mb-2">
                    <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                    <p
                        class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Disetujui
                    </p>
                </div>
                <p
                    class="text-4xl font-bold tracking-tighter text-zinc-900 font-mono"
                >
                    {data.byStatus?.Disetujui ?? 0}
                </p>
            </div>
        </div>

        <!-- Middle Row: Status Distribution & Quick Actions -->
        {#if data.stats.totalLaporan > 0}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4">
                <!-- Status Distribution -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2
                            class="text-sm font-bold text-zinc-800 uppercase tracking-widest"
                        >
                            Distribusi Status
                        </h2>
                        <a
                            href="/rekap"
                            class="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
                            >Rekap <ArrowRight class="w-3 h-3" /></a
                        >
                    </div>

                    <!-- Segmented bar -->
                    <div
                        class="h-2 rounded-full overflow-hidden flex gap-0.5 bg-zinc-100"
                    >
                        {#each statusMeta as s}
                            {@const pct =
                                ((data.byStatus?.[s.key] ?? 0) /
                                    data.stats.totalLaporan) *
                                100}
                            {#if pct > 0}
                                <div
                                    class="h-full {s.bar} transition-all duration-700"
                                    style="width: {pct}%"
                                    title="{s.key}: {data.byStatus?.[
                                        s.key
                                    ]} ({Math.round(pct)}%)"
                                ></div>
                            {/if}
                        {/each}
                    </div>

                    <!-- Legend -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {#each statusMeta as s}
                            {@const count = data.byStatus?.[s.key] ?? 0}
                            {@const pct =
                                data.stats.totalLaporan > 0
                                    ? Math.round(
                                          (count / data.stats.totalLaporan) *
                                              100,
                                      )
                                    : 0}
                            <div
                                class="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100"
                            >
                                <div class="flex items-center gap-2 mb-2">
                                    <span
                                        class="w-2.5 h-2.5 rounded-full {s.bar} shrink-0"
                                    ></span>
                                    <span
                                        class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
                                        >{s.key}</span
                                    >
                                </div>
                                <div class="flex items-baseline gap-2">
                                    <p
                                        class="text-2xl font-bold text-zinc-900 font-mono"
                                    >
                                        {count}
                                    </p>
                                    <p
                                        class="text-[10px] font-medium text-zinc-400"
                                    >
                                        {pct}%
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="space-y-6 lg:border-l lg:border-zinc-100 lg:pl-8">
                    <h2
                        class="text-sm font-bold text-zinc-800 uppercase tracking-widest"
                    >
                        Aksi Cepat
                    </h2>
                    <div class="flex flex-col gap-3">
                        <a
                            href="/laporan"
                            class="group flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
                        >
                            <div
                                class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:scale-110 transition-transform"
                            >
                                <FileText class="w-4 h-4" />
                            </div>
                            <span class="text-sm font-semibold text-zinc-700"
                                >Semua Laporan</span
                            >
                        </a>

                        {#if data.role === 'petugas'}
                            <a
                                href="/laporan/buat"
                                class="group flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
                            >
                                <div
                                    class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"
                                >
                                    <Plus class="w-4 h-4" />
                                </div>
                                <span class="text-sm font-semibold text-zinc-700"
                                    >Input Kegiatan Baru</span
                                >
                            </a>
                            <a
                                href="/revisi"
                                class="group flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
                            >
                                <div
                                    class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"
                                >
                                    <Clock class="w-4 h-4" />
                                </div>
                                <span class="text-sm font-semibold text-zinc-700"
                                    >Riwayat Revisian</span
                                >
                            </a>
                        {/if}

                        {#if data.role === 'admin' || data.role === 'kepala_bidang'}
                            <a
                                href="/verifikasi"
                                class="group flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all"
                            >
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"
                                    >
                                        <Activity class="w-4 h-4" />
                                    </div>
                                    <span
                                        class="text-sm font-semibold text-amber-900"
                                        >Verifikasi Laporan</span
                                    >
                                </div>
                                {#if (data.byStatus?.Pending ?? 0) > 0}
                                    <span
                                        class="text-[10px] font-bold bg-amber-500 text-white px-2 py-1 rounded-full"
                                        >{data.byStatus?.Pending}</span
                                    >
                                {/if}
                            </a>
                        {/if}

                        {#if data.role === 'admin' || data.role === 'kepala_bidang' || data.role === 'pimpinan'}
                            <a
                                href="/rekap"
                                class="group flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
                            >
                                <div
                                    class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:scale-110 transition-transform"
                                >
                                    <FileSpreadsheet class="w-4 h-4" />
                                </div>
                                <span class="text-sm font-semibold text-zinc-700"
                                    >Rekap & Statistik</span
                                >
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}

    <!-- GENDER CHART (non-petugas) -->
    {#if data.stats.totalLaki > 0 || data.stats.totalPerempuan > 0}
        <div class="py-4 border-t border-zinc-100">
            <h2
                class="text-sm font-bold text-zinc-800 uppercase tracking-widest mb-6 flex items-center gap-2"
            >
                <Users class="w-4 h-4 text-zinc-400" /> Distribusi Gender Peserta
            </h2>
            <div
                class="flex flex-col sm:flex-row items-center gap-8 bg-zinc-50/50 rounded-3xl border border-zinc-100 p-6"
            >
                <!-- Donut SVG -->
                <div class="relative shrink-0">
                    <svg viewBox="0 0 100 100" class="w-40 h-40 -rotate-90">
                        <!-- Track -->
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#f4f4f5"
                            stroke-width="14"
                        />
                        <!-- Laki (blue) -->
                        {#if lakiArc > 0}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#3b82f6"
                                stroke-width="14"
                                stroke-dasharray="{lakiArc} {C - lakiArc}"
                                stroke-linecap="butt"
                            />
                        {/if}
                        <!-- Perempuan (pink) -->
                        {#if prmpnArc > 0}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#ec4899"
                                stroke-width="14"
                                stroke-dasharray="{prmpnArc} {C - prmpnArc}"
                                stroke-dashoffset={C - lakiArc}
                                stroke-linecap="butt"
                            />
                        {/if}
                    </svg>
                    <!-- Center label -->
                    <div
                        class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <span
                            class="text-lg font-bold text-zinc-900 font-mono leading-none"
                            >{totalGender.toLocaleString("id-ID")}</span
                        >
                        <span
                            class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5"
                            >Peserta</span
                        >
                    </div>
                </div>

                <!-- Legend -->
                <div class="flex flex-col gap-4 flex-1">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"
                        >
                            <span class="text-xs font-black text-blue-600"
                                >L</span
                            >
                        </div>
                        <div class="flex-1">
                            <p
                                class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"
                            >
                                Laki-laki
                            </p>
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-2xl font-bold text-zinc-900 font-mono"
                                    >{data.stats.totalLaki.toLocaleString(
                                        "id-ID",
                                    )}</span
                                >
                                <span class="text-sm font-bold text-blue-500"
                                    >{lakiPct}%</span
                                >
                            </div>
                            <div
                                class="mt-1.5 h-1 rounded-full bg-zinc-100 overflow-hidden"
                            >
                                <div
                                    class="h-full bg-blue-500 rounded-full transition-all duration-700"
                                    style="width:{lakiPct}%"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0"
                        >
                            <span class="text-xs font-black text-pink-600"
                                >P</span
                            >
                        </div>
                        <div class="flex-1">
                            <p
                                class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"
                            >
                                Perempuan
                            </p>
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-2xl font-bold text-zinc-900 font-mono"
                                    >{data.stats.totalPerempuan.toLocaleString(
                                        "id-ID",
                                    )}</span
                                >
                                <span class="text-sm font-bold text-pink-500"
                                    >{prmpnPct}%</span
                                >
                            </div>
                            <div
                                class="mt-1.5 h-1 rounded-full bg-zinc-100 overflow-hidden"
                            >
                                <div
                                    class="h-full bg-pink-500 rounded-full transition-all duration-700"
                                    style="width:{prmpnPct}%"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- RECENT ACTIVITY (Shared by all roles) -->
    <div class="pt-4 border-t border-zinc-100">
        <div class="flex items-center justify-between mb-6">
            <h2
                class="text-sm font-bold text-zinc-800 uppercase tracking-widest flex items-center gap-2"
            >
                <Activity class="w-4 h-4 text-zinc-400" /> Aktivitas Terbaru
            </h2>
            <a
                href="/laporan"
                class="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >Lihat Semua →</a
            >
        </div>

        {#if laporan.length === 0}
            <div
                class="p-12 text-center flex flex-col items-center justify-center bg-zinc-50/50 rounded-3xl border border-zinc-100"
            >
                <div
                    class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-300 border border-zinc-200 mb-3"
                >
                    <FileText class="w-6 h-6" />
                </div>
                <p class="font-bold text-zinc-700 text-sm">Belum ada laporan</p>
                <p class="text-xs text-zinc-400 mt-1">
                    Laporan terbaru akan muncul di sini.
                </p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each laporan as lap}
                    <a
                        href="/laporan/{lap.idLaporan}"
                        class="group block bg-white p-5 rounded-2xl border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all"
                    >
                        <div class="flex items-start justify-between mb-4">
                            <StatusBadge status={lap.statusVerifikasi} />
                            <span
                                class="text-[10px] font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md"
                            >
                                {new Date(
                                    lap.tanggalKegiatan,
                                ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                })}
                            </span>
                        </div>
                        <h3
                            class="font-bold text-zinc-900 text-sm line-clamp-1 group-hover:text-zinc-600 transition-colors mb-1"
                        >
                            {lap.namaKegiatan}
                        </h3>
                        <p class="text-xs text-zinc-500 mb-4">
                            {lap.desa?.namaDesa ?? "-"}, {lap.kecamatan
                                ?.namaKecamatan ?? "-"}
                        </p>

                        <div
                            class="flex items-center gap-4 pt-4 border-t border-zinc-100"
                        >
                            <div class="flex items-center gap-1.5 min-w-0">
                                <div
                                    class="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 shrink-0"
                                >
                                    {lap.namaLengkap
                                        ?.substring(0, 2)
                                        .toUpperCase() ?? "??"}
                                </div>
                                <span
                                    class="text-[10px] font-medium text-zinc-600 truncate"
                                    >{lap.namaLengkap ?? "-"}</span
                                >
                            </div>
                            <div
                                class="flex items-center gap-1 text-[10px] font-medium text-zinc-500 shrink-0 ml-auto bg-zinc-50 px-1.5 py-0.5 rounded"
                            >
                                <Users class="w-3 h-3" />
                                {lap.jumlahPeserta}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        background-color: #ffffff;
        -webkit-font-smoothing: antialiased;
    }
</style>
