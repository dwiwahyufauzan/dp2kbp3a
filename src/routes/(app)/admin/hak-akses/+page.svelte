<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData, PageData } from "./$types";
    import {
        ShieldCheck,
        FileSpreadsheet,
        Layers,
        LineChart,
        Grid2X2,
        Users,
        CheckCircle2,
        FileX2,
        Shield,
        ShieldAlert,
        Check,
        HelpCircle,
    } from "lucide-svelte";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    interface Role {
        idRole: string;
        namaRole: string;
        permissions: string[] | null;
    }

    const roles = $derived(data.roles as Role[]);

    // Available system permissions
    const systemPermissions = [
        {
            key: "buat_laporan",
            label: "Buat Laporan",
            description:
                "Mengizinkan pengguna untuk membuat, mengedit, mengirim laporan, serta mengunggah berkas dokumentasi.",
            icon: FileSpreadsheet,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        },
        {
            key: "verifikasi_laporan",
            label: "Verifikasi Laporan",
            description:
                "Mengizinkan pengguna untuk menyetujui, menolak, atau meminta revisi laporan kegiatan.",
            icon: ShieldCheck,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        },
        {
            key: "rekap_laporan",
            label: "Lihat Rekapitulasi & Ekspor",
            description:
                "Mengizinkan akses ke halaman rekapitulasi dan fitur ekspor data ke format spreadsheet Excel.",
            icon: Layers,
            color: "text-amber-600 bg-amber-50 border-amber-100",
        },
        {
            key: "lihat_statistik",
            label: "Lihat Analitik & Statistik",
            description:
                "Mengizinkan akses ke visualisasi tren grafik, diagram status, dan ringkasan tren bulanan.",
            icon: LineChart,
            color: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            key: "kelola_master",
            label: "Kelola Master Data",
            description:
                "Mengizinkan pengelolaan data master seperti Unit Kerja, Jenis Kegiatan, dan Lokasi.",
            icon: Grid2X2,
            color: "text-rose-600 bg-rose-50 border-rose-100",
        },
        {
            key: "kelola_pengguna",
            label: "Kelola Pengguna",
            description:
                "Mengizinkan pengguna untuk menambah, mengubah, dan menghapus data pengguna (akun) di sistem.",
            icon: Users,
            color: "text-violet-600 bg-violet-50 border-violet-100",
        },
        {
            key: "kelola_hak_akses",
            label: "Kelola Hak Akses",
            description:
                "Mengizinkan pengguna untuk mengatur hak akses/izin masing-masing peran pengguna.",
            icon: Shield,
            color: "text-teal-600 bg-teal-50 border-teal-100",
        },
    ];

    const roleDescriptions: Record<string, string> = {
        admin: "Administrator Utama dengan kendali penuh atas sistem dan hak akses.",
        petugas:
            "Petugas Lapangan operasional yang bertugas melaporkan kegiatan.",
        kepala_bidang:
            "Verifikator internal yang memverifikasi laporan kegiatan bidang.",
        pimpinan:
            "Eksekutif pemantau yang memerlukan akses rekap dan visualisasi analitik.",
    };

    const roleLabels: Record<string, string> = {
        admin: "Administrator",
        petugas: "Petugas Lapangan",
        kepala_bidang: "Kepala Bidang",
        pimpinan: "Pimpinan",
    };

    let selectedRoleIndex = $state(0);
    const selectedRole = $derived(roles[selectedRoleIndex] || null);

    // Current permissions of selected role as a reactive state set
    let activePermissions = $state<string[]>([]);
    let loading = $state(false);

    $effect(() => {
        if (selectedRole) {
            let perms = selectedRole.permissions;
            if (typeof perms === 'string') {
                try {
                    perms = JSON.parse(perms);
                } catch {
                    perms = [];
                }
            }
            activePermissions = perms || [];
        }
    });

    function togglePermission(key: string) {
        if (selectedRole?.namaRole === "admin") return; // Cannot toggle admin permissions

        if (activePermissions.includes(key)) {
            activePermissions = activePermissions.filter((p) => p !== key);
        } else {
            activePermissions = [...activePermissions, key];
        }
    }

    let successMessage = $state("");
    let errorMessage = $state("");

    $effect(() => {
        if (form?.success) {
            successMessage = "Hak akses berhasil diperbarui!";
            errorMessage = "";
            const t = setTimeout(() => (successMessage = ""), 4000);
            return () => clearTimeout(t);
        }
        if (form?.error) {
            errorMessage = form.error;
            successMessage = "";
        }
    });
</script>

<svelte:head>
    <title>Manajemen Hak Akses — Console</title>
</svelte:head>

<div
    class="mx-auto max-w-7xl space-y-8 p-4 sm:p-8 pb-24 sm:pb-32 animate-in fade-in duration-700"
>
    <header
        class="flex flex-col gap-2 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between"
    >
        <div>
            <div
                class="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
            >
                <Shield class="h-4 w-4" />
                <span>Kontrol Keamanan</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-zinc-900">
                Pengaturan Hak Akses
            </h1>
            <p class="mt-2 text-sm font-medium text-zinc-500">
                Konfigurasikan pembatasan fitur sistem untuk masing-masing peran
                pengguna.
            </p>
        </div>
    </header>

    {#if successMessage || errorMessage}
        <div class="flex flex-col gap-3">
            {#if successMessage}
                <div
                    class="flex items-center gap-3 rounded-xl bg-zinc-900 p-4 text-sm font-semibold text-white shadow-lg animate-in slide-in-from-top-4 duration-300"
                >
                    <CheckCircle2 class="h-5 w-5 shrink-0 text-emerald-400" />
                    {successMessage}
                </div>
            {/if}

            {#if errorMessage}
                <div
                    class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm animate-in slide-in-from-top-4 duration-300"
                >
                    <FileX2 class="h-5 w-5 shrink-0 text-rose-500" />
                    {errorMessage}
                </div>
            {/if}
        </div>
    {/if}

    <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div class="space-y-4 lg:col-span-4">
            <h2
                class="px-1 text-xs font-bold uppercase tracking-widest text-zinc-500"
            >
                Pilih Peran Pengguna
            </h2>

            <div class="flex flex-col gap-3">
                {#each roles as r, idx}
                    <button
                        onclick={() => {
                            selectedRoleIndex = idx;
                        }}
                        class="group relative flex w-full flex-col gap-2 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2
                        {selectedRoleIndex === idx
                            ? 'border-zinc-900 bg-white shadow-md ring-1 ring-zinc-900/10'
                            : 'border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-sm'}"
                    >
                        {#if selectedRoleIndex === idx}
                            <div
                                class="absolute bottom-0 left-0 top-0 w-1.5 bg-zinc-900"
                            ></div>
                        {/if}

                        <div class="flex items-center justify-between pl-1">
                            <span
                                class="text-sm font-bold uppercase tracking-wider text-zinc-900"
                            >
                                {roleLabels[r.namaRole] ?? r.namaRole}
                            </span>

                            {#if r.namaRole === "admin"}
                                <span
                                    class="rounded-md border border-zinc-900 bg-zinc-900 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                                >
                                    Full Access
                                </span>
                            {:else}
                                <span
                                    class="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] font-bold text-zinc-600"
                                >
                                    {(r.permissions || []).length} Izin
                                </span>
                            {/if}
                        </div>

                        <p
                            class="pl-1 text-xs font-medium leading-relaxed text-zinc-500"
                        >
                            {roleDescriptions[r.namaRole] ??
                                "Pengguna dengan hak akses tertentu."}
                        </p>
                    </button>
                {/each}
            </div>
        </div>

        <div class="lg:col-span-8">
            {#if selectedRole}
                <div
                    class="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all"
                >
                    <div
                        class="flex flex-col gap-4 border-b border-zinc-100 bg-zinc-50/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                    >
                        <div>
                            <div
                                class="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                            >
                                Hak Akses Aktif untuk
                            </div>
                            <h3
                                class="mt-1 text-xl font-extrabold uppercase tracking-wide text-zinc-900"
                            >
                                {roleLabels[selectedRole.namaRole] ??
                                    selectedRole.namaRole}
                            </h3>
                        </div>

                        {#if selectedRole.namaRole === "admin"}
                            <div
                                class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600"
                            >
                                <ShieldAlert class="h-4 w-4 text-zinc-500" />
                                Izin Admin Terkunci
                            </div>
                        {/if}
                    </div>

                    <form
                        method="POST"
                        action="?/updatePermissions"
                        use:enhance={() => {
                            loading = true;
                            return async ({ update }) => {
                                await update();
                                loading = false;
                            };
                        }}
                        class="p-6 sm:p-8"
                    >
                        <input
                            type="hidden"
                            name="idRole"
                            value={selectedRole.idRole}
                        />
                        <input
                            type="hidden"
                            name="permissions"
                            value={JSON.stringify(activePermissions)}
                        />

                        <div class="flex flex-col divide-y divide-zinc-100">
                            {#each systemPermissions as perm}
                                {@const isChecked =
                                    selectedRole.namaRole === "admin" ||
                                    activePermissions.includes(perm.key)}

                                <div
                                    class="group flex items-start gap-5 py-5 first:pt-0 last:pb-0"
                                    role="button"
                                    tabindex="0"
                                    onclick={() => togglePermission(perm.key)}
                                    onkeydown={(e) =>
                                        e.key === "Enter" &&
                                        togglePermission(perm.key)}
                                >
                                    <div class="pt-0.5">
                                        <button
                                            type="button"
                                            disabled={selectedRole.namaRole ===
                                                "admin"}
                                            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60
                                            {isChecked
                                                ? 'bg-zinc-900'
                                                : 'bg-zinc-200'}"
                                            aria-label="Toggle {perm.label}"
                                        >
                                            <span
                                                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                                {isChecked
                                                    ? 'translate-x-5'
                                                    : 'translate-x-0'}"
                                            ></span>
                                        </button>
                                    </div>

                                    <div class="flex-1 space-y-1.5">
                                        <div class="flex items-center gap-3">
                                            <span
                                                class="text-sm font-bold text-zinc-900 transition-colors group-hover:text-black select-none"
                                            >
                                                {perm.label}
                                            </span>
                                            {#if selectedRole.namaRole === "admin"}
                                                <span
                                                    class="rounded bg-zinc-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-zinc-500"
                                                >
                                                    BAWAAN
                                                </span>
                                            {/if}
                                        </div>
                                        <p
                                            class="text-xs font-medium leading-relaxed text-zinc-500 select-none"
                                        >
                                            {perm.description}
                                        </p>
                                    </div>

                                    <div
                                        class="hidden shrink-0 items-center justify-center rounded-xl border p-2 sm:flex {perm.color}"
                                    >
                                        <svelte:component
                                            this={perm.icon}
                                            class="h-5 w-5"
                                        />
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <div class="mt-8 border-t border-zinc-100 pt-6">
                            {#if selectedRole.namaRole !== "admin"}
                                <div class="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        class="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                                    >
                                        {#if loading}
                                            <span class="animate-pulse"
                                                >Memproses...</span
                                            >
                                        {:else}
                                            <Check class="h-4 w-4" />
                                            Simpan Hak Akses
                                        {/if}
                                    </button>
                                </div>
                            {:else}
                                <div
                                    class="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs font-medium leading-relaxed text-zinc-600"
                                >
                                    <HelpCircle
                                        class="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                                    />
                                    <span>
                                        Peran <strong>Administrator</strong> selalu
                                        memiliki seluruh hak akses sistem secara
                                        bawaan (default). Hal ini untuk mencegah
                                        hilangnya akses kendali utama pada console
                                        pengaturan.
                                    </span>
                                </div>
                            {/if}
                        </div>
                    </form>
                </div>
            {/if}
        </div>
    </div>
</div>
