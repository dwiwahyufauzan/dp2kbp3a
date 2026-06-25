<script lang="ts">
	interface Props {
		open: boolean
		title?: string
		message: string
		confirmLabel?: string
		cancelLabel?: string
		type?: 'danger' | 'warning' | 'success' | 'info'
		subtext?: string
		onConfirm: () => void
		onCancel: () => void
	}

	let {
		open,
		title,
		message,
		confirmLabel,
		cancelLabel = 'Batal',
		type = 'danger',
		subtext,
		onConfirm,
		onCancel,
	}: Props = $props()

	// Derived classes based on type
	const styles = $derived.by(() => {
		switch (type) {
			case 'success':
				return {
					headerBg: 'from-emerald-500 to-emerald-400',
					iconBg: 'bg-emerald-50 border-emerald-100',
					iconColor: 'text-emerald-500',
					titleColor: 'text-emerald-500',
					buttonBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
					defaultSubtext: 'Data akan disimpan ke sistem.'
				};
			case 'warning':
				return {
					headerBg: 'from-amber-500 to-amber-400',
					iconBg: 'bg-amber-50 border-amber-100',
					iconColor: 'text-amber-500',
					titleColor: 'text-amber-500',
					buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
					defaultSubtext: 'Harap periksa kembali sebelum melanjutkan.'
				};
			case 'info':
				return {
					headerBg: 'from-zinc-700 to-zinc-600',
					iconBg: 'bg-zinc-50 border-zinc-100',
					iconColor: 'text-zinc-500',
					titleColor: 'text-zinc-600',
					buttonBg: 'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-100',
					defaultSubtext: 'Apakah Anda yakin ingin melanjutkan?'
				};
			case 'danger':
			default:
				return {
					headerBg: 'from-rose-500 to-rose-400',
					iconBg: 'bg-rose-50 border-rose-100',
					iconColor: 'text-rose-500',
					titleColor: 'text-rose-500',
					buttonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
					defaultSubtext: 'Tindakan ini tidak dapat dibatalkan.'
				};
		}
	});

	const displayTitle = $derived(title ?? (
		type === 'danger' ? 'Konfirmasi Hapus' :
		type === 'warning' ? 'Konfirmasi Ubah' :
		type === 'success' ? 'Konfirmasi Tambah' : 'Konfirmasi'
	));

	const displayConfirmLabel = $derived(confirmLabel ?? (
		type === 'danger' ? 'Ya, Hapus' :
		type === 'warning' ? 'Ya, Simpan' :
		type === 'success' ? 'Ya, Tambah' : 'Ya'
	));

	const displaySubtext = $derived(subtext ?? styles.defaultSubtext);
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
			class="absolute inset-0 w-full h-full cursor-default bg-transparent border-none"
			onclick={onCancel}
			aria-label="Tutup"
			tabindex="-1"
		></button>

		<div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-150">
			<!-- Header strip -->
			<div class="h-1 w-full bg-gradient-to-r {styles.headerBg}"></div>

			<div class="p-6">
				<div class="flex items-start gap-4 mb-6">
					<!-- Icon -->
					<div class="shrink-0 w-10 h-10 rounded-xl {styles.iconBg} border flex items-center justify-center">
						{#if type === 'danger'}
							<svg class="w-5 h-5 {styles.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						{:else if type === 'warning'}
							<svg class="w-5 h-5 {styles.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						{:else if type === 'success'}
							<svg class="w-5 h-5 {styles.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else}
							<svg class="w-5 h-5 {styles.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<div>
						<p id="confirm-title" class="text-[10px] font-black uppercase tracking-widest {styles.titleColor} mb-1">{displayTitle}</p>
						<p class="text-sm font-semibold text-zinc-800 leading-snug">{message}</p>
						{#if displaySubtext}
							<p class="text-xs text-zinc-400 mt-1">{displaySubtext}</p>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={onCancel}
						class="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onclick={onConfirm}
						class="flex-1 px-4 py-2.5 {styles.buttonBg} text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all"
					>
						{displayConfirmLabel}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
