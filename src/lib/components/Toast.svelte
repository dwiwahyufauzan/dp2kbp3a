<script lang="ts">
	import { toasts } from '$lib/stores/toasts.svelte'

	const labelMap = {
		success: 'BERHASIL',
		error:   'GAGAL',
		warning: 'PERINGATAN',
		info:    'INFO',
	}

	const accentMap = {
		success: 'border-l-emerald-500',
		error:   'border-l-red-500',
		warning: 'border-l-amber-500',
		info:    'border-l-zinc-400',
	}

	const labelColorMap = {
		success: 'text-emerald-600',
		error:   'text-red-600',
		warning: 'text-amber-600',
		info:    'text-zinc-400',
	}

	const iconMap = {
		success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />`,
		error:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />`,
		warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v3m0 3.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />`,
		info:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />`,
	}

	const iconColorMap = {
		success: 'text-emerald-500',
		error:   'text-red-500',
		warning: 'text-amber-500',
		info:    'text-zinc-400',
	}
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-xs w-full pointer-events-none">
	{#each toasts.list as toast (toast.id)}
		<div
			class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 bg-white rounded-2xl border border-zinc-100 border-l-4 shadow-xl {accentMap[toast.type]} animate-toast-in"
			role="alert"
		>
			<svg class="w-4 h-4 mt-0.5 shrink-0 {iconColorMap[toast.type]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html iconMap[toast.type]}
			</svg>
			<div class="flex-1 min-w-0">
				<p class="text-[10px] font-black tracking-widest uppercase mb-0.5 {labelColorMap[toast.type]}">{labelMap[toast.type]}</p>
				<p class="text-sm font-semibold text-zinc-800 leading-snug">{toast.message}</p>
			</div>
			<button
				onclick={() => toasts.dismiss(toast.id)}
				class="shrink-0 text-zinc-300 hover:text-zinc-600 transition-colors mt-0.5"
				aria-label="Tutup notifikasi"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes toast-in {
		from { opacity: 0; transform: translateX(16px) scale(0.97); }
		to   { opacity: 1; transform: translateX(0) scale(1); }
	}
	:global(.animate-toast-in) {
		animation: toast-in 0.18s ease-out both;
	}
</style>
