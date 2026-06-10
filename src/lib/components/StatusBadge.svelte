<script lang="ts">
	import type { StatusVerifikasi } from '$lib/types'

	let { status }: { status: StatusVerifikasi | string } = $props()

	const config: Record<string, { bg: string; text: string; dot: string }> = {
		Pending:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
		Disetujui:  { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
		Ditolak:    { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
		Revisi:     { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' }
	}

	const c = $derived(config[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' })
</script>

<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium {c.bg} {c.text}">
	<span class="w-1.5 h-1.5 rounded-full {c.dot}"></span>
	{status}
</span>
