<script lang="ts">
	/**
	 * WilayahSelect — Pilih Kecamatan → Desa/Kelurahan di Kabupaten Subang.
	 *
	 * Mode "laporan":
	 *   Compose menjadi satu hidden input (fieldName).
	 *   Contoh: "Desa Sukamulya, Kec. Cijambe, Kab. Subang, detail..."
	 *
	 * Mode "lokasi-tugas":
	 *   Dua hidden input terpisah: namaKecamatan + namaDesa.
	 */

	type Wilayah = { id: string; name: string }
	type Mode = 'laporan' | 'lokasi-tugas'

	// Kode Kabupaten Subang di API emsifa (BPS: 3213)
	const SUBANG_ID = '3213'

	interface Props {
		mode?: Mode
		fieldName?: string
		kecamatanFieldName?: string
		desaFieldName?: string
		detailPlaceholder?: string
		required?: boolean
		initialDetail?: string
		initialKecamatan?: string
		initialDesa?: string
	}

	let {
		mode = 'laporan',
		fieldName = 'lokasiDetail',
		kecamatanFieldName = 'namaKecamatan',
		desaFieldName = 'namaDesa',
		detailPlaceholder = 'Detail alamat (RT/RW, gedung, dll.) — opsional',
		required = false,
		initialDetail = '',
		initialKecamatan = '',
		initialDesa = ''
	}: Props = $props()

	const inputClass =
		'w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

	function toTitle(s: string) {
		return s.toLowerCase().replace(/(^\w|\s\w)/g, (c) => c.toUpperCase())
	}

	let kecamatanList = $state<Wilayah[]>([])
	let desaList = $state<Wilayah[]>([])

	let selKecamatan = $state('')
	let selDesa = $state('')
	let txtKecamatan = $state('')
	let txtDesa = $state('')
	let detail = $state('')
	$effect(() => { detail = initialDetail })

	let loadingKec = $state(true)
	let loadingDesa = $state(false)

	let composedValue = $derived(buildComposed())
	let kecamatanValue = $derived(txtKecamatan || initialKecamatan)
	let desaValue = $derived(txtDesa || initialDesa)

	function buildComposed() {
		const parts: string[] = []
		if (txtDesa) parts.push(txtDesa)
		if (txtKecamatan) parts.push(`Kec. ${txtKecamatan}`)
		parts.push('Kab. Subang')
		const base = parts.join(', ')
		if (detail.trim()) return `${base}, ${detail.trim()}`
		return base
	}

	// Muat kecamatan Subang saat mount
	$effect(() => {
		fetch(`/api/wilayah/kecamatan/${SUBANG_ID}`)
			.then((r) => r.json())
			.then((d: Wilayah[]) => { kecamatanList = d })
			.catch(() => { kecamatanList = [] })
			.finally(() => { loadingKec = false })
	})

	async function onKecamatanChange(e: Event) {
		const id = (e.target as HTMLSelectElement).value
		const found = kecamatanList.find((k) => k.id === id)
		selKecamatan = id
		txtKecamatan = found ? toTitle(found.name) : ''
		selDesa = ''
		txtDesa = ''
		desaList = []
		if (!id) return
		loadingDesa = true
		try {
			const r = await fetch(`/api/wilayah/desa/${id}`)
			desaList = await r.json()
		} finally {
			loadingDesa = false
		}
	}

	function onDesaChange(e: Event) {
		const id = (e.target as HTMLSelectElement).value
		const found = desaList.find((d) => d.id === id)
		selDesa = id
		txtDesa = found ? toTitle(found.name) : ''
	}
</script>

<div class="space-y-3">
	<!-- Kecamatan -->
	<div>
		<label for="wil-kecamatan" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
			Kecamatan{required ? ' *' : ''}
		</label>
		<select
			id="wil-kecamatan"
			onchange={onKecamatanChange}
			class={inputClass}
			disabled={loadingKec}
			aria-label="Pilih Kecamatan"
		>
			<option value="">{loadingKec ? 'Memuat kecamatan...' : '-- Pilih Kecamatan --'}</option>
			{#each kecamatanList as k}
				<option value={k.id}>{toTitle(k.name)}</option>
			{/each}
		</select>
	</div>

	<!-- Desa / Kelurahan -->
	<div>
		<label for="wil-desa" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
			Desa / Kelurahan{required ? ' *' : ''}
		</label>
		<select
			id="wil-desa"
			onchange={onDesaChange}
			class={inputClass}
			disabled={!selKecamatan || loadingDesa}
			aria-label="Pilih Desa"
		>
			<option value="">
				{#if !selKecamatan}Pilih kecamatan dulu{:else if loadingDesa}Memuat...{:else}-- Pilih Desa / Kelurahan --{/if}
			</option>
			{#each desaList as d}
				<option value={d.id}>{toTitle(d.name)}</option>
			{/each}
		</select>
	</div>

	<!-- Detail tambahan (hanya mode laporan) -->
	{#if mode === 'laporan'}
		<div>
			<label for="wil-detail" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
				Detail Lokasi <span class="font-normal text-zinc-400 normal-case tracking-normal">(opsional)</span>
			</label>
			<input
				id="wil-detail"
				type="text"
				bind:value={detail}
				placeholder={detailPlaceholder}
				class={inputClass}
				aria-label="Detail Lokasi"
			/>
		</div>
	{/if}

	<!-- Preview -->
	{#if txtKecamatan || kecamatanValue}
		<div class="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl">
			<p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Dipilih:</p>
			<p class="text-sm font-semibold text-zinc-900">
				{#if mode === 'laporan'}
					{composedValue}
				{:else}
					{kecamatanValue}{desaValue ? ' — ' + desaValue : ''}
				{/if}
			</p>
		</div>
	{/if}

	<!-- Hidden inputs -->
	{#if mode === 'laporan'}
		<input type="hidden" name={fieldName} value={composedValue} {required} />
	{:else}
		<input type="hidden" name={kecamatanFieldName} value={kecamatanValue} {required} />
		<input type="hidden" name={desaFieldName} value={desaValue} {required} />
	{/if}
</div>
