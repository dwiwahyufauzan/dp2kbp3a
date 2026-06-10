<script lang="ts">
    import { enhance } from "$app/forms";
    import { toasts } from "$lib/stores/toasts.svelte";
    import type { ActionData, PageData } from "./$types";
    import {
        UserCircle,
        Mail,
        Lock,
        CheckCircle2,
        Eye,
        EyeOff,
        Building2,
        MapPin,
        Shield,
    } from "lucide-svelte";
    import { untrack } from "svelte";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const profil = $derived(data.profil);
    let loading = $state(false);
    let showPassword = $state(false);

    const roleLabels: Record<string, string> = {
        admin: "Administrator",
        petugas: "Petugas Lapangan",
        kepala_bidang: "Kepala Bidang",
        pimpinan: "Pimpinan",
    };

    $effect(() => {
        if (form) {
            untrack(() => {
                if (form?.success)
                    toasts.success("Profil berhasil diperbarui.");
                if (form?.error) toasts.error(form.error as string);
            });
        }
    });
</script>

<svelte:head><title>Profil User — Console</title></svelte:head>

<div
    class="max-w-7xl mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700"
>
    <!-- HEADER -->
    <header class="border-b border-zinc-100 pb-6">
        <div
            class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
        >
            <UserCircle class="w-3 h-3" /> Akun Saya
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-zinc-900">Profil</h1>
        <p class="text-zinc-500 mt-1 font-light">
            Kelola informasi akun dan keamanan Anda.
        </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- KOLOM KIRI: info kartu profil -->
        <div class="lg:col-span-1 space-y-4">
            {#if profil}
                <!-- Avatar card -->
                <div
                    class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
                >
                    <div
                        class="bg-zinc-950 px-6 py-8 flex flex-col items-center text-center gap-3"
                    >
                        <div
                            class="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl font-black text-white"
                        >
                            {profil.namaLengkap
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </div>
                        <div>
                            <p class="text-lg font-bold text-white">
                                {profil.namaLengkap}
                            </p>
                            <p class="text-sm text-zinc-400 mt-0.5">
                                {profil.email}
                            </p>
                            <span
                                class="mt-2 inline-block px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-bold text-zinc-300 uppercase tracking-widest"
                            >
                                {roleLabels[profil.namaRole] ?? profil.namaRole}
                            </span>
                        </div>
                    </div>

                    <!-- Detail info -->
                    <div class="divide-y divide-zinc-100">
                        <div class="px-6 py-4 flex items-start gap-3">
                            <Building2
                                class="w-4 h-4 text-zinc-400 mt-0.5 shrink-0"
                            />
                            <div>
                                <p
                                    class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"
                                >
                                    Bidang
                                </p>
                                <p class="text-sm font-semibold text-zinc-800">
                                    {profil.namaBidang ?? "—"}
                                </p>
                            </div>
                        </div>
                        <div class="px-6 py-4 flex items-start gap-3">
                            <MapPin
                                class="w-4 h-4 text-zinc-400 mt-0.5 shrink-0"
                            />
                            <div>
                                <p
                                    class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1"
                                >
                                    Lokasi Tugas
                                </p>
                                <p class="text-sm font-semibold text-zinc-800">
                                    {#if profil.namaKecamatan}
                                        {#if !profil.namaDesa || profil.namaDesa === '-' || profil.namaDesa === profil.namaKecamatan}
                                            {profil.namaKecamatan}
                                        {:else}
                                            {profil.namaKecamatan} — {profil.namaDesa}
                                        {/if}
                                    {:else}
                                        —
                                    {/if}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <p class="text-xs text-zinc-400 text-center px-2">
                Untuk mengubah bidang, lokasi tugas, atau role, hubungi
                Administrator.
            </p>
        </div>

        <!-- KOLOM KANAN: form edit -->
        <div class="lg:col-span-2">
            <div
                class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
            >
                <div
                    class="px-6 py-5 border-b border-zinc-100 flex items-center gap-3"
                >
                    <Shield class="w-4 h-4 text-zinc-400" />
                    <h2 class="font-bold text-zinc-900">Ubah Informasi Akun</h2>
                </div>

                <form
                    method="POST"
                    action="?/update"
                    use:enhance={() => {
                        loading = true;
                        return async ({ update }) => {
                            await update();
                            loading = false;
                        };
                    }}
                    class="p-6 space-y-5"
                >
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label
                                for="namaLengkap"
                                class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2"
                            >
                                Nama Lengkap
                            </label>
                            <input
                                id="namaLengkap"
                                name="namaLengkap"
                                type="text"
                                value={profil?.namaLengkap ?? ""}
                                placeholder="Nama lengkap Anda"
                                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                            />
                        </div>

                        <div>
                            <label
                                for="email"
                                class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2"
                            >
                                <span class="flex items-center gap-1.5"
                                    ><Mail class="w-3 h-3" /> Alamat Email</span
                                >
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={profil?.email ?? ""}
                                placeholder="email@contoh.com"
                                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            for="password"
                            class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2"
                        >
                            <span class="flex items-center gap-1.5"
                                ><Lock class="w-3 h-3" /> Password Baru
                                <span
                                    class="font-normal text-zinc-400 normal-case tracking-normal"
                                    >(kosongkan jika tidak ingin diubah)</span
                                ></span
                            >
                        </label>
                        <div class="relative max-w-sm">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 karakter"
                                minlength="8"
                                class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all pr-10 placeholder:text-zinc-400"
                            />
                            <button
                                type="button"
                                onclick={() => (showPassword = !showPassword)}
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

                    <div
                        class="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3"
                    >
                        <button
                            type="submit"
                            disabled={loading}
                            class="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl shadow-md transition-all"
                        >
                            {#if loading}
                                Memproses...
                            {:else}
                                <CheckCircle2 class="w-4 h-4" /> Simpan Perubahan
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
