<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { Activity, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-svelte';

    let { form }: { form: ActionData } = $props();

    let loading = $state(false);
    let showPassword = $state(false);
</script>

<svelte:head>
    <title>Login — Console DP2KBP3A</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white">
    <div class="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
        
        <!-- Logo & Header -->
        <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-zinc-900/50 mb-5 relative">
                <!-- Glowing element -->
                <div class="absolute inset-0 bg-white/5 blur-xl rounded-full"></div>
                <Activity class="w-8 h-8 text-zinc-100 relative z-10" />
            </div>
            <h1 class="text-2xl font-extrabold text-white tracking-tight">Console</h1>
            <p class="text-zinc-500 text-xs mt-2 uppercase tracking-[0.2em] font-bold font-mono">DP2KBP3A Monitor</p>
        </div>

        <!-- Form Card -->
        <div class="bg-zinc-900/50 border border-zinc-800/80 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
            <h2 class="text-lg font-bold text-white mb-6">Autentikasi Sistem</h2>

            {#if form?.error}
                <div class="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle class="w-5 h-5 text-rose-500 shrink-0" />
                    <p class="text-sm font-medium text-rose-400">{form.error}</p>
                </div>
            {/if}

            <form
                method="POST"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }}
                class="space-y-5"
            >
                <div>
                    <label for="email" class="block text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest mb-2">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        value={form?.email ?? ''}
                        class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-white focus:border-zinc-700 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-600"
                        placeholder="admin@sistem.local"
                    />
                </div>

                <div>
                    <label for="password" class="block text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest mb-2">
                        Kata Sandi
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autocomplete="current-password"
                            required
                            class="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-white focus:border-zinc-700 outline-none transition-all text-sm font-medium text-white pr-12 placeholder:text-zinc-600"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onclick={() => (showPassword = !showPassword)}
                            class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {#if showPassword}
                                <EyeOff class="w-4 h-4" />
                            {:else}
                                <Eye class="w-4 h-4" />
                            {/if}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-3.5 px-4 mt-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400 text-zinc-950 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/5 relative overflow-hidden"
                >
                    {#if loading}
                        <Loader2 class="w-4 h-4 animate-spin" />
                        Memproses...
                    {:else}
                        Autentikasi
                    {/if}
                </button>
            </form>
        </div>

        <div class="mt-8 text-center">
            <p class="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                VER {new Date().getFullYear()} &copy; DP2KBP3A
            </p>
        </div>
    </div>
</div>