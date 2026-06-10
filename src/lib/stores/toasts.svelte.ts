/**
 * Toast store — Svelte 5 runes-based global notification system
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: number
	message: string
	type: ToastType
	duration: number
}

let _toasts = $state<Toast[]>([])
let _nextId = 0

export const toasts = {
	get list() { return _toasts },

	show(message: string, type: ToastType = 'info', duration = 4000) {
		const id = ++_nextId
		_toasts = [..._toasts, { id, message, type, duration }]
		setTimeout(() => this.dismiss(id), duration)
	},

	success(message: string, duration = 4000) { this.show(message, 'success', duration) },
	error(message: string, duration = 5000)   { this.show(message, 'error',   duration) },
	warning(message: string, duration = 4500) { this.show(message, 'warning', duration) },
	info(message: string, duration = 4000)    { this.show(message, 'info',    duration) },

	dismiss(id: number) {
		_toasts = _toasts.filter((t) => t.id !== id)
	},
}
