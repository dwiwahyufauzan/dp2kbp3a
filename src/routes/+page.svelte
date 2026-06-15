<script lang="ts">
    import type { PageData } from "./$types";
    import logo from "$lib/assets/logo.jpeg";
    import {
        Users,
        HeartHandshake,
        UserCheck,
        ShieldAlert,
        ArrowRight,
        CheckCircle2,
        LogIn,
        FileText,
        BarChart3,
        LayoutDashboard,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();
    const isLoggedIn = $derived(!!data.user);
</script>

<svelte:head>
    <title>DP2KBP3A — Sistem Pelaporan Kegiatan Lapangan</title>
</svelte:head>

<div
    class="min-h-screen bg-zinc-50 flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-zinc-900 relative"
>
    <div class="fixed inset-0 pointer-events-none z-0">
        <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div
            class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/15 blur-[100px] md:blur-[150px] animate-blob"
        ></div>
        <div
            class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/15 blur-[100px] md:blur-[150px] animate-blob animation-delay-2000"
        ></div>
        <div
            class="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-rose-400/10 blur-[100px] md:blur-[150px] animate-blob animation-delay-4000"
        ></div>
    </div>

    <nav
        class="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-zinc-200/50 transition-all duration-300"
    >
        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        >
            <div
                class="flex items-center gap-3 md:gap-4 group cursor-pointer animate-fade-in-up"
            >
                <img
                    src={logo}
                    alt="Logo DP2KBP3A"
                    class="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover shadow-sm ring-1 ring-zinc-200 shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500"
                />
                <div>
                    <span
                        class="text-sm md:text-base font-black text-zinc-900 uppercase tracking-widest block leading-none"
                        >DP2KBP3A</span
                    >
                    <span
                        class="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block"
                        >Sistem Monitoring</span
                    >
                </div>
            </div>

            <div
                class="flex items-center gap-4 animate-fade-in-up"
                style="animation-delay: 0.1s;"
            >
                {#if isLoggedIn}
                    <a
                        href="/dashboard"
                        class="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-zinc-900/20 active:scale-95"
                    >
                        <LayoutDashboard class="w-4 h-4" />
                        <span class="hidden sm:inline">Dashboard</span>
                    </a>
                {:else}
                    <a
                        href="/login"
                        class="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-zinc-900/20 active:scale-95"
                    >
                        <LogIn class="w-4 h-4" />
                        <span class="hidden sm:inline">Masuk Portal</span>
                    </a>
                {/if}
            </div>
        </div>
    </nav>

    <section
        class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-28 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
    >
        <div class="flex-1 space-y-6 text-center lg:text-left z-10 w-full">
            <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200/80 text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-widest shadow-sm animate-fade-in-up"
                style="animation-delay: 0.2s;"
            >
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                    ></span>
                </span>
                Platform Lini Lapangan
            </div>

            <h1
                class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-[1.1] max-w-2xl mx-auto lg:mx-0 animate-fade-in-up"
                style="animation-delay: 0.3s;"
            >
                Transformasi Digital <br class="hidden lg:block" />
                <span
                    class="bg-gradient-to-r from-blue-600 via-emerald-600 to-zinc-900 bg-clip-text text-transparent animate-gradient-x"
                    >DP2KBP3A</span
                >
            </h1>

            <p
                class="text-zinc-500 font-medium text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up"
                style="animation-delay: 0.4s;"
            >
                Menyatukan petugas lapangan, verifikator bidang, dan pimpinan
                untuk pendataan operasional secara akurat dan terintegrasi
                secara <span
                    class="text-zinc-800 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500/50"
                    >real-time</span
                >.
            </p>

            <div
                class="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4 animate-fade-in-up"
                style="animation-delay: 0.5s;"
            >
                {#if isLoggedIn}
                    <a
                        href="/dashboard"
                        class="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-zinc-900/20 active:scale-95 group"
                    >
                        Masuk Dashboard <ArrowRight
                            class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        />
                    </a>
                {:else}
                    <a
                        href="/login"
                        class="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-zinc-900/20 active:scale-95 group relative overflow-hidden"
                    >
                        <div
                            class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
                        ></div>
                        Portal Petugas <LogIn
                            class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        />
                    </a>
                {/if}
                <a
                    href="#program"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/80 hover:bg-white backdrop-blur-sm border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                >
                    Pelajari Program
                </a>
            </div>
        </div>

        <div
            class="flex-1 w-full max-w-md lg:max-w-none relative mt-12 lg:mt-0 perspective-1000 animate-fade-in-up"
            style="animation-delay: 0.6s;"
        >
            <div
                class="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-emerald-500/30 rounded-[3rem] blur-3xl -z-10 transform rotate-3 scale-105 animate-pulse"
            ></div>

            <div
                class="bg-white/80 border border-zinc-200/60 rounded-[2rem] shadow-2xl p-5 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-xl relative overflow-hidden animate-float"
            >
                <div
                    class="flex items-center justify-between border-b border-zinc-100 pb-4"
                >
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-rose-400"></div>
                        <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div
                        class="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono"
                    >
                        Console Overview
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 sm:gap-5">
                    <div
                        class="p-4 sm:p-5 rounded-2xl border border-zinc-100/80 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div
                            class="flex items-center justify-between text-zinc-400 mb-3"
                        >
                            <span
                                class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"
                                >Total Laporan</span
                            >
                            <div
                                class="p-1.5 bg-zinc-50 rounded-lg text-emerald-500"
                            >
                                <FileText class="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div
                            class="text-2xl sm:text-3xl font-black text-zinc-900 font-mono tracking-tight"
                        >
                            1.250+
                        </div>
                        <span
                            class="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-md uppercase mt-3 inline-block"
                            >100% Valid</span
                        >
                    </div>
                    <div
                        class="p-4 sm:p-5 rounded-2xl border border-zinc-100/80 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div
                            class="flex items-center justify-between text-zinc-400 mb-3"
                        >
                            <span
                                class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"
                                >Aktivitas</span
                            >
                            <div
                                class="p-1.5 bg-zinc-50 rounded-lg text-blue-500"
                            >
                                <BarChart3 class="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div
                            class="text-2xl sm:text-3xl font-black text-zinc-900 font-mono tracking-tight"
                        >
                            98.4%
                        </div>
                        <span
                            class="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-1 rounded-md uppercase mt-3 inline-block"
                            >Aktif Lapangan</span
                        >
                    </div>
                </div>

                <div class="space-y-4">
                    <div
                        class="text-[10px] font-black text-zinc-400 uppercase tracking-widest"
                    >
                        Alur Pelaporan Real-Time
                    </div>
                    <div class="space-y-3">
                        <div
                            class="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md group"
                        >
                            <div
                                class="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-100 shrink-0 group-hover:scale-110 transition-transform"
                            >
                                1
                            </div>
                            <span class="text-xs font-bold text-zinc-700"
                                >Input Data Lini Lapangan</span
                            >
                            <span
                                class="text-[9px] font-bold text-zinc-400 ml-auto uppercase font-mono bg-zinc-50 px-2 py-1 rounded-md"
                                >08:15</span
                            >
                        </div>
                        <div
                            class="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-blue-200 hover:shadow-md group"
                        >
                            <div
                                class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100 shrink-0 group-hover:scale-110 transition-transform"
                            >
                                2
                            </div>
                            <span class="text-xs font-bold text-zinc-700"
                                >Verifikasi Kepala Bidang</span
                            >
                            <span
                                class="text-[9px] font-bold text-zinc-400 ml-auto uppercase font-mono bg-zinc-50 px-2 py-1 rounded-md"
                                >10:30</span
                            >
                        </div>
                        <div
                            class="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-purple-200 hover:shadow-md group"
                        >
                            <div
                                class="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-bold border border-purple-100 shrink-0 group-hover:scale-110 transition-transform"
                            >
                                3
                            </div>
                            <span class="text-xs font-bold text-zinc-700"
                                >Integrasi Data Pimpinan</span
                            >
                            <span
                                class="text-[9px] font-bold text-zinc-400 ml-auto uppercase font-mono bg-zinc-50 px-2 py-1 rounded-md"
                                >Selesai</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section
        id="program"
        class="relative z-10 py-20 sm:py-28 bg-white/40 backdrop-blur-3xl border-t border-zinc-200/50 overflow-hidden"
    >
        <div
            class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-100/30 rounded-[100%] blur-[80px] -z-10"
        ></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
                class="text-center space-y-4 max-w-2xl mx-auto mb-16 sm:mb-20 animate-fade-in-up"
            >
                <div
                    class="inline-block text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100"
                >
                    4 Pilar Utama
                </div>
                <h2
                    class="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight"
                >
                    Fokus Lini Lapangan
                </h2>
                <p
                    class="text-zinc-500 font-medium text-sm sm:text-base leading-relaxed max-w-lg mx-auto"
                >
                    Sistem pemantauan yang mencakup empat bidang pilar utama
                    dengan struktur kegiatan yang fleksibel dan terpadu.
                </p>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
                <div
                    class="p-8 rounded-[2rem] border border-zinc-200/60 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-500 group hover:shadow-2xl hover:shadow-blue-500/15 flex flex-col justify-between h-[22rem] relative overflow-hidden hover:-translate-y-2 cursor-default animate-fade-in-up"
                    style="animation-delay: 0.1s;"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>
                    <div
                        class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/20 to-transparent group-hover:scale-150 transition-transform duration-700 blur-2xl"
                    ></div>

                    <div
                        class="w-14 h-14 rounded-2xl bg-white border border-blue-100 text-blue-600 shadow-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 z-10 relative"
                    >
                        <Users class="w-6 h-6" />
                    </div>
                    <div class="space-y-3 mt-auto z-10 relative">
                        <h3
                            class="text-xl font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight"
                        >
                            Pengendalian<br />Penduduk
                        </h3>
                        <p
                            class="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-700 transition-colors"
                        >
                            Penyuluhan demografi, data laju pertumbuhan, serta
                            pembinaan kader.
                        </p>
                    </div>
                </div>

                <div
                    class="p-8 rounded-[2rem] border border-zinc-200/60 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-500 group hover:shadow-2xl hover:shadow-emerald-500/15 flex flex-col justify-between h-[22rem] relative overflow-hidden hover:-translate-y-2 cursor-default lg:translate-y-6 animate-fade-in-up"
                    style="animation-delay: 0.2s;"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>
                    <div
                        class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent group-hover:scale-150 transition-transform duration-700 blur-2xl"
                    ></div>

                    <div
                        class="w-14 h-14 rounded-2xl bg-white border border-emerald-100 text-emerald-600 shadow-sm flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 z-10 relative"
                    >
                        <UserCheck class="w-6 h-6" />
                    </div>
                    <div class="space-y-3 mt-auto z-10 relative">
                        <h3
                            class="text-xl font-extrabold text-zinc-900 group-hover:text-emerald-600 transition-colors duration-300 leading-tight"
                        >
                            Keluarga<br />Berencana
                        </h3>
                        <p
                            class="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-700 transition-colors"
                        >
                            Pelayanan KB, konseling keluarga, dan monitoring
                            peserta aktif.
                        </p>
                    </div>
                </div>

                <div
                    class="p-8 rounded-[2rem] border border-zinc-200/60 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-500 group hover:shadow-2xl hover:shadow-rose-500/15 flex flex-col justify-between h-[22rem] relative overflow-hidden hover:-translate-y-2 cursor-default animate-fade-in-up"
                    style="animation-delay: 0.3s;"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>
                    <div
                        class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-rose-400/20 to-transparent group-hover:scale-150 transition-transform duration-700 blur-2xl"
                    ></div>

                    <div
                        class="w-14 h-14 rounded-2xl bg-white border border-rose-100 text-rose-600 shadow-sm flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 z-10 relative"
                    >
                        <HeartHandshake class="w-6 h-6" />
                    </div>
                    <div class="space-y-3 mt-auto z-10 relative">
                        <h3
                            class="text-xl font-extrabold text-zinc-900 group-hover:text-rose-600 transition-colors duration-300 leading-tight"
                        >
                            Pemberdayaan<br />Perempuan
                        </h3>
                        <p
                            class="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-700 transition-colors"
                        >
                            Ekonomi wanita kreatif, pembinaan gender, dan
                            penguatan kapasitas.
                        </p>
                    </div>
                </div>

                <div
                    class="p-8 rounded-[2rem] border border-zinc-200/60 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/15 flex flex-col justify-between h-[22rem] relative overflow-hidden hover:-translate-y-2 cursor-default lg:translate-y-6 animate-fade-in-up"
                    style="animation-delay: 0.4s;"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>
                    <div
                        class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-400/20 to-transparent group-hover:scale-150 transition-transform duration-700 blur-2xl"
                    ></div>

                    <div
                        class="w-14 h-14 rounded-2xl bg-white border border-purple-100 text-purple-600 shadow-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 z-10 relative"
                    >
                        <ShieldAlert class="w-6 h-6" />
                    </div>
                    <div class="space-y-3 mt-auto z-10 relative">
                        <h3
                            class="text-xl font-extrabold text-zinc-900 group-hover:text-purple-600 transition-colors duration-300 leading-tight"
                        >
                            Perlindungan<br />Anak
                        </h3>
                        <p
                            class="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-700 transition-colors"
                        >
                            Sosialisasi hak anak, konseling parenting, serta
                            mitigasi kekerasan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section
        class="relative z-10 py-20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 animate-gradient-x bg-[length:200%_auto] text-white overflow-hidden shadow-[inset_0_20px_40px_rgba(0,0,0,0.5)]"
    >
        <div
            class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"
        ></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-center divide-y sm:divide-y-0 divide-zinc-800/80"
            >
                <div class="space-y-2 pt-6 sm:pt-0 group cursor-default">
                    <div
                        class="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 group-hover:scale-110 transition-transform duration-300"
                    >
                        4
                    </div>
                    <p
                        class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors"
                    >
                        Integrasi Bidang
                    </p>
                </div>
                <div
                    class="space-y-2 pt-6 sm:pt-0 md:border-l md:border-zinc-800/80 group cursor-default"
                >
                    <div
                        class="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 group-hover:scale-110 transition-transform duration-300"
                    >
                        100%
                    </div>
                    <p
                        class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors"
                    >
                        Data Tervalidasi
                    </p>
                </div>
                <div
                    class="space-y-2 pt-6 sm:pt-0 md:border-l md:border-zinc-800/80 group cursor-default"
                >
                    <div
                        class="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 group-hover:scale-110 transition-transform duration-300"
                    >
                        24/7
                    </div>
                    <p
                        class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors"
                    >
                        Sistem Real-Time
                    </p>
                </div>
                <div
                    class="space-y-2 pt-6 sm:pt-0 md:border-l md:border-zinc-800/80 group cursor-default"
                >
                    <div
                        class="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 group-hover:scale-110 transition-transform duration-300"
                    >
                        API
                    </div>
                    <p
                        class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors"
                    >
                        Akses Multi-Format
                    </p>
                </div>
            </div>
        </div>
    </section>

    <footer
        class="bg-zinc-950 text-zinc-400 py-12 sm:py-16 border-t border-zinc-900 z-10 mt-auto relative"
    >
        <div
            class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"
        ></div>
        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8"
        >
            <div class="flex items-center gap-4 group">
                <img
                    src={logo}
                    alt="Logo DP2KBP3A"
                    class="w-12 h-12 rounded-xl object-cover shrink-0 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                <div class="text-center md:text-left">
                    <span
                        class="text-sm font-black text-white uppercase tracking-widest block"
                        >DP2KBP3A</span
                    >
                    <span
                        class="text-[10px] text-zinc-500 font-semibold block mt-1 uppercase tracking-wider"
                        >Kabupaten Sleman — Indonesia</span
                    >
                </div>
            </div>

            <div
                class="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
            >
                <a href="/login" class="hover:text-white transition-colors"
                    >Masuk Portal</a
                >
                <a href="#program" class="hover:text-white transition-colors"
                    >Program Lini Lapangan</a
                >
                <a
                    href="https://github.com/dwiwahyufauzan/dp2kbp3a"
                    target="_blank"
                    class="hover:text-white transition-colors"
                    >Repository GitHub</a
                >
            </div>

            <div
                class="text-center md:text-right text-[10px] text-zinc-600 font-medium leading-relaxed"
            >
                &copy; {new Date().getFullYear()} DP2KBP3A.<br
                    class="hidden md:block"
                />
                All rights reserved.
            </div>
        </div>
    </footer>
</div>

<style>
    /* Blob / Breathing Background */
    @keyframes blob {
        0% {
            transform: translate(0px, 0px) scale(1);
        }
        33% {
            transform: translate(30px, -50px) scale(1.1);
        }
        66% {
            transform: translate(-20px, 20px) scale(0.9);
        }
        100% {
            transform: translate(0px, 0px) scale(1);
        }
    }
    .animate-blob {
        animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .animation-delay-4000 {
        animation-delay: 4s;
    }

    /* Floating Mockup */
    @keyframes float {
        0% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-15px);
        }
        100% {
            transform: translateY(0px);
        }
    }
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    /* Staggered Fade In Up */
    @keyframes fade-in-up {
        0% {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
            filter: blur(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }
    .animate-fade-in-up {
        opacity: 0;
        animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Moving Gradient Background (Stats Section) */
    @keyframes gradient-x {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    .animate-gradient-x {
        animation: gradient-x 15s ease infinite;
    }

    /* Shimmer Effect for Buttons */
    @keyframes shimmer {
        100% {
            transform: translateX(100%);
        }
    }
</style>
