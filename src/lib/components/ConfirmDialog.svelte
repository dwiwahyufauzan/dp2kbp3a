<script lang="ts">
	interface Props {
		open: boolean
		title?: string
		message: string
		confirmLabel?: string
		onConfirm: () => void
		onCancel: () => void
	}

	let {
		open,
		title = 'Konfirmasi Hapus',
		message,
		confirmLabel = 'Ya, Hapus',
		onConfirm,
		onCancel,
	}: Props = $props()
</script>

{#if open}
	<!-- svelte-ignore a11y_click_outside_not_interactive -->
	<div
		class="fixed inset-0 backdrop-blur-sm bg-zinc-900/40 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-150"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<!-- Backdrop click to cancel -->
		<button
			class="absolute inset-0 w-full h-full cursor-default"
			onclick={onCancel}
			aria-label="Tutup"
			tabindex="-1"
		></button>

		<div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-150">
			<!-- Header strip -->
			<div class="h-1 w-full bg-gradient-to-r from-rose-500 to-rose-400"></div>

			<div class="p-6">
				<div class="flex items-start gap-4 mb-6">
					<!-- Icon -->
					<div class="shrink-0 w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
						<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</div>
					<div>
						<p id="confirm-title" class="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{title}</p>
						<p class="text-sm font-semibold text-zinc-800 leading-snug">{message}</p>
						<p class="text-xs text-zinc-400 mt-1">Tindakan ini tidak dapat dibatalkan.</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={onCancel}
						class="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all"
					>
						Batal
					</button>
					<button
						type="button"
						onclick={onConfirm}
						class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md shadow-rose-100 transition-all"
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
