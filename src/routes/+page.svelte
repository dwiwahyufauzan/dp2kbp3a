<script lang="ts">
    import type { PageData } from './$types';
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
        LayoutDashboard 
    } from 'lucide-svelte';

    let { data }: { data: PageData } = $props();
    const isLoggedIn = $derived(!!data.user);
</script>

<svelte:head>
    <title>DP2KBP3A — Sistem Pelaporan Kegiatan Lapangan</title>
</svelte:head>

<div class="min-h-screen bg-zinc-50 flex flex-col font-sans overflow-x-hidden selection:bg-zinc-900 selection:text-white">
    <!-- BACKGROUND DECORATIONS (GLOWING MESH) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div class="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px]"></div>
        <div class="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-rose-400/5 blur-[120px]"></div>
    </div>

    <!-- NAVBAR -->
    <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100/80 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-md shadow-zinc-200 shrink-0">
                    <span class="font-extrabold text-sm tracking-tighter">DP</span>
                </div>
                <div>
                    <span class="text-sm font-black text-zinc-900 uppercase tracking-wider block leading-none">DP2KBP3A</span>
                    <span class="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 block">Sistem Monitoring Terpadu</span>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                {#if isLoggedIn}
                    <a 
                        href="/dashboard" 
                        class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-zinc-200"
                    >
                        <LayoutDashboard class="w-3.5 h-3.5" /> Dashboard
                    </a>
                {:else}
                    <a 
                        href="/login" 
                        class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-zinc-200"
                    >
                        <LogIn class="w-3.5 h-3.5" /> Masuk Portal
                    </a>
                {/if}
            </div>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col lg:flex-row items-center gap-16">
        <!-- Hero Text -->
        <div class="flex-1 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/50 text-[10px] font-bold text-zinc-600 uppercase tracking-widest animate-fade-in">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Platform Terintegrasi Lini Lapangan
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.08] max-w-2xl mx-auto lg:mx-0">
                Transformasi Digital Pelaporan <span class="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-transparent">DP2KBP3A</span>
            </h1>
            <p class="text-zinc-500 font-light text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Menyatukan petugas lapangan, verifikator bidang, dan pimpinan untuk pendataan pengendalian penduduk, keluarga berencana, pemberdayaan perempuan, dan perlindungan anak secara real-time.
            </p>
            
            <div class="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 pt-2">
                {#if isLoggedIn}
                    <a 
                        href="/dashboard" 
                        class="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-zinc-250 shrink-0"
                    >
                        Masuk ke Dashboard <ArrowRight class="w-4 h-4" />
                    </a>
                {:else}
                    <a 
                        href="/login" 
                        class="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-zinc-250 shrink-0"
                    >
                        Masuk ke Portal Petugas <LogIn class="w-4 h-4" />
                    </a>
                {/if}
                <a 
                    href="#program" 
                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm"
                >
                    Pelajari Program
                </a>
            </div>
        </div>

        <!-- Hero Graphic (Interactive Glassmorphic Mockup) -->
        <div class="flex-1 w-full max-w-lg lg:max-w-none relative animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <!-- Back decorative glow -->
            <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 rounded-[3rem] blur-xl -z-10 transform rotate-3 scale-105"></div>
            
            <!-- Main Mockup Container -->
            <div class="bg-white border border-zinc-200/80 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-xl relative overflow-hidden">
                <!-- Top bar mockup -->
                <div class="flex items-center justify-between border-b border-zinc-100 pb-5">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-rose-400"></div>
                        <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Console Overview</div>
                </div>

                <!-- KPI Cards Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                        <div class="flex items-center justify-between text-zinc-400 mb-2">
                            <span class="text-[9px] font-bold uppercase tracking-wider">Total Laporan</span>
                            <FileText class="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <div class="text-2xl font-black text-zinc-900 font-mono">1.250+</div>
                        <span class="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">100% Valid</span>
                    </div>
                    <div class="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                        <div class="flex items-center justify-between text-zinc-400 mb-2">
                            <span class="text-[9px] font-bold uppercase tracking-wider">Aktivitas</span>
                            <BarChart3 class="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <div class="text-2xl font-black text-zinc-900 font-mono">98.4%</div>
                        <span class="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">Aktif Lapangan</span>
                    </div>
                </div>

                <!-- Mini Timeline Mockup -->
                <div class="space-y-3">
                    <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alur Pelaporan Real-Time</div>
                    <div class="space-y-2.5">
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-zinc-55 border border-zinc-100/50">
                            <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">1</div>
                            <span class="text-xs font-semibold text-zinc-700">Input Data & Dokumentasi oleh Petugas</span>
                            <span class="text-[8px] font-bold text-zinc-400 ml-auto uppercase font-mono">08:15</span>
                        </div>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-zinc-55 border border-zinc-100/50">
                            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</div>
                            <span class="text-xs font-semibold text-zinc-700">Verifikasi & Penilaian Kepala Bidang</span>
                            <span class="text-[8px] font-bold text-zinc-400 ml-auto uppercase font-mono">10:30</span>
                        </div>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-zinc-55 border border-zinc-100/50">
                            <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">3</div>
                            <span class="text-xs font-semibold text-zinc-700">Ringkasan Grafik Terpadu Pimpinan</span>
                            <span class="text-[8px] font-bold text-zinc-400 ml-auto uppercase font-mono">Selesai</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PILAR PROGRAM SECTION -->
    <section id="program" class="relative z-10 py-24 bg-white border-t border-zinc-150/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center space-y-3 max-w-2xl mx-auto mb-16">
                <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pilar Utama Program</div>
                <h2 class="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                    Fokus Kegiatan Lini Lapangan
                </h2>
                <p class="text-zinc-500 font-light text-sm sm:text-base leading-relaxed">
                    Sistem pemantauan mencakup empat bidang pilar utama dengan struktur kegiatan yang fleksibel dan terpadu.
                </p>
            </div>

            <!-- Program cards grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Program Card 1 -->
                <div class="p-6 rounded-[2rem] border border-zinc-100 hover:border-blue-200 bg-zinc-50/50 hover:bg-white transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between h-80 relative overflow-hidden">
                    <div class="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/5 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Users class="w-5 h-5" />
                    </div>
                    <div class="space-y-2 mt-8">
                        <h3 class="font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors duration-300">Pengendalian Penduduk</h3>
                        <p class="text-xs text-zinc-500 font-light leading-relaxed">Penyuluhan demografi kependudukan, pengumpulan data laju pertumbuhan, serta pembinaan kader lokal secara periodik.</p>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-blue-500 mt-4 block">Pelajari Laporan →</span>
                </div>

                <!-- Program Card 2 -->
                <div class="p-6 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 bg-zinc-50/50 hover:bg-white transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between h-80 relative overflow-hidden">
                    <div class="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                        <UserCheck class="w-5 h-5" />
                    </div>
                    <div class="space-y-2 mt-8">
                        <h3 class="font-extrabold text-zinc-900 group-hover:text-emerald-600 transition-colors duration-300">Keluarga Berencana</h3>
                        <p class="text-xs text-zinc-500 font-light leading-relaxed">Pelayanan KB mobile, konseling perencanaan keluarga, monitoring peserta aktif, serta pendampingan kontrasepsi.</p>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-emerald-500 mt-4 block">Pelajari Laporan →</span>
                </div>

                <!-- Program Card 3 -->
                <div class="p-6 rounded-[2rem] border border-zinc-100 hover:border-rose-200 bg-zinc-50/50 hover:bg-white transition-all duration-300 group hover:shadow-xl hover:shadow-rose-500/5 flex flex-col justify-between h-80 relative overflow-hidden">
                    <div class="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-rose-500/5 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                        <HeartHandshake class="w-5 h-5" />
                    </div>
                    <div class="space-y-2 mt-8">
                        <h3 class="font-extrabold text-zinc-900 group-hover:text-rose-600 transition-colors duration-300">Pemberdayaan Perempuan</h3>
                        <p class="text-xs text-zinc-500 font-light leading-relaxed">Pelatihan ekonomi wanita kreatif, pembinaan gender, penguatan kapasitas perempuan, dan pembelaan hak perempuan.</p>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-rose-500 mt-4 block">Pelajari Laporan →</span>
                </div>

                <!-- Program Card 4 -->
                <div class="p-6 rounded-[2rem] border border-zinc-100 hover:border-purple-200 bg-zinc-50/50 hover:bg-white transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/5 flex flex-col justify-between h-80 relative overflow-hidden">
                    <div class="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-purple-500/5 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <ShieldAlert class="w-5 h-5" />
                    </div>
                    <div class="space-y-2 mt-8">
                        <h3 class="font-extrabold text-zinc-900 group-hover:text-purple-600 transition-colors duration-300">Perlindungan Anak</h3>
                        <p class="text-xs text-zinc-500 font-light leading-relaxed">Sosialisasi hak tumbuh kembang anak, pembentukan Forum Anak wilayah, konseling parenting, serta mitigasi kekerasan.</p>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-purple-500 mt-4 block">Pelajari Laporan →</span>
                </div>
            </div>
        </div>
    </section>

    <!-- STATS OVERVIEW SECTION -->
    <section class="relative z-10 py-16 bg-zinc-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div class="space-y-1">
                    <div class="text-3xl sm:text-4xl font-extrabold font-mono text-white">4 Bidang</div>
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Integrasi Program Dinas</p>
                </div>
                <div class="space-y-1 border-l border-zinc-800">
                    <div class="text-3xl sm:text-4xl font-extrabold font-mono text-white">100%</div>
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Data Tervalidasi</p>
                </div>
                <div class="space-y-1 border-l border-zinc-800">
                    <div class="text-3xl sm:text-4xl font-extrabold font-mono text-white">Real-Time</div>
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Monitoring Monitoring</p>
                </div>
                <div class="space-y-1 border-l border-zinc-800">
                    <div class="text-3xl sm:text-4xl font-extrabold font-mono text-white">Multi-Format</div>
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Dokumentasi Terpadu</p>
                </div>
            </div>
        </div>
    </section>

    <!-- BRANDS/FOOTER -->
    <footer class="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900 z-10 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-white shrink-0">
                    <span class="font-extrabold text-sm tracking-tighter">DP</span>
                </div>
                <div>
                    <span class="text-sm font-black text-white uppercase tracking-wider block">DP2KBP3A</span>
                    <span class="text-[9px] text-zinc-500 font-semibold block mt-0.5">Kabupaten Sleman — Indonesia</span>
                </div>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-6 text-xs font-semibold uppercase tracking-wider">
                <a href="/login" class="hover:text-white transition-colors">Masuk Portal</a>
                <a href="#program" class="hover:text-white transition-colors">Program Lini Lapangan</a>
                <a href="https://github.com/dwiwahyufauzan/dp2kbp3a" target="_blank" class="hover:text-white transition-colors">GitHub Repository</a>
            </div>
            
            <div class="text-center md:text-right text-[10px] text-zinc-650 font-medium">
                &copy; {new Date().getFullYear()} DP2KBP3A. All rights reserved. <br/>
                Sistem Informasi Terpadu Pelaporan Lini Lapangan.
            </div>
        </div>
    </footer>
</div>
