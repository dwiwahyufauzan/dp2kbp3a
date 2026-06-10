<script lang="ts">
    import { enhance } from '$app/forms';
    import { toasts } from '$lib/stores/toasts.svelte';
    import type { ActionData, PageData } from './$types';
    import { FilePlus2, ChevronLeft, LayoutGrid, Calendar, Users, FileText, Check, Upload, FileArchive, FileSpreadsheet } from 'lucide-svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let loading = $state(false);
    let fileInput = $state<HTMLInputElement | null>(null);
    let selectedFiles = $state<File[]>([]);

    // Bidang yang dipilih petugas
    let selectedBidangId = $state<string>(form?.values?.idBidang ?? '');

    const today = new Date().toISOString().split('T')[0];

    // Kegiatan yang difilter berdasarkan bidang yang dipilih
    const filteredKegiatan = $derived.by(() => {
        const allKegiatan = (data as PageData & { jenisKegiatan?: { idJenis: string; namaKegiatan: string; idBidang: string | null }[] }).jenisKegiatan ?? [];
        if (!selectedBidangId) return [];
        return allKegiatan.filter(k => k.idBidang === selectedBidangId);
    });

    const FILE_ACCEPT = 'image/*,application/pdf,application/zip,.zip,.docx,.xlsx,.doc,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    function onFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        selectedFiles = input.files ? Array.from(input.files) : [];
    }

    function removeFile(index: number) {
        selectedFiles = selectedFiles.filter((_, i) => i !== index);
        if (fileInput) {
            const dt = new DataTransfer();
            selectedFiles.forEach(f => dt.items.add(f));
            fileInput.files = dt.files;
        }
    }

    function formatSize(bytes: number) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileIcon(file: File) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'img';
        if (ext === 'pdf') return 'pdf';
        if (ext === 'zip') return 'zip';
        if (['docx','doc'].includes(ext)) return 'doc';
        if (['xlsx','xls'].includes(ext)) return 'xls';
        return 'bin';
    }

    $effect(() => {
        if (form?.error) toasts.error(form.error);
    });
</script>

<svelte:head><title>Buat Laporan — DP2KBP3A</title></svelte:head>

<div class="max-w-[1000px] mx-auto space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
    <a href="/laporan" class="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-900 transition-colors">
        <ChevronLeft class="w-4 h-4" /> Kembali ke Laporan
    </a>

    <header class="pb-8 border-b border-zinc-100">
        <div class="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            <FilePlus2 class="w-3 h-3" /> Input Data Baru
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-zinc-900">Buat Laporan Kegiatan</h1>
        <p class="text-zinc-500 mt-1 font-light">Pilih bidang dan jenis kegiatan, lalu lengkapi form berikut.</p>
    </header>

    {#if form?.error}
        <div class="p-4 bg-rose-50/50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 shadow-sm">
            {form.error}
        </div>
    {/if}

    <form
        method="POST"
        enctype="multipart/form-data"
        use:enhance={() => {
            loading = true;
            return async ({ update }) => { await update(); loading = false; };
        }}
        class="space-y-6"
    >
        <!-- STEP 1: PILIH BIDANG -->
        <div class="pb-6 border-b border-zinc-100">
            <label for="idBidang" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                <LayoutGrid class="w-3 h-3" /> Bidang Kegiatan <span class="text-rose-500">*</span>
            </label>
            <p class="text-[10px] text-zinc-400 mb-3">Pilih bidang sesuai kegiatan yang dilaksanakan. Jenis kegiatan akan muncul otomatis.</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {#each ((data as PageData & { bidangList?: { idBidang: string; namaBidang: string }[] }).bidangList ?? []) as b}
                    <label class="relative cursor-pointer">
                        <input
                            type="radio"
                            name="idBidang"
                            value={b.idBidang}
                            required
                            bind:group={selectedBidangId}
                            class="sr-only peer"
                        />
                        <div class="w-full px-4 py-3.5 rounded-xl border-2 border-zinc-200 bg-zinc-50/50 text-sm font-semibold text-zinc-700 transition-all
                            peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white
                            hover:border-zinc-400 hover:bg-white flex items-center gap-3">
                            <span class="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                                <span class="w-2 h-2 rounded-full bg-current peer-checked:block hidden"></span>
                            </span>
                            {b.namaBidang}
                        </div>
                    </label>
                {/each}
            </div>

            {#if selectedBidangId && filteredKegiatan.length === 0}
                <p class="mt-3 text-[10px] text-amber-600 font-bold">⚠ Belum ada kegiatan terdaftar untuk bidang ini. Hubungi admin.</p>
            {/if}
        </div>

        <!-- STEP 2: JENIS KEGIATAN + TANGGAL -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label for="idJenis" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    <FileText class="w-3 h-3" /> Jenis Kegiatan <span class="text-rose-500">*</span>
                </label>
                <select
                    id="idJenis"
                    name="idJenis"
                    required
                    disabled={!selectedBidangId || filteredKegiatan.length === 0}
                    class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">{selectedBidangId ? '-- Pilih Jenis Kegiatan --' : '-- Pilih bidang dahulu --'}</option>
                    {#each filteredKegiatan as jenis}
                        <option value={jenis.idJenis} selected={form?.values?.idJenis === jenis.idJenis}>
                            {jenis.namaKegiatan}
                        </option>
                    {/each}
                </select>
                {#if selectedBidangId}
                    <p class="text-[10px] text-zinc-400 mt-1.5">{filteredKegiatan.length} kegiatan tersedia.</p>
                {/if}
            </div>

            <div>
                <label for="tanggalKegiatan" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    <Calendar class="w-3 h-3" /> Tanggal Kegiatan <span class="text-rose-500">*</span>
                </label>
                <input
                    id="tanggalKegiatan"
                    name="tanggalKegiatan"
                    type="date"
                    required
                    max={today}
                    value={form?.values?.tanggalKegiatan ?? today}
                    class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
                />
            </div>
        </div>

        <!-- LOKASI -->
        <div>
            <label for="lokasiDetail" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Lokasi Kegiatan <span class="text-rose-500">*</span>
            </label>
            <input
                id="lokasiDetail"
                name="lokasiDetail"
                type="text"
                required
                value={form?.values?.lokasiDetail ?? ''}
                placeholder="Contoh: Aula Balai Desa Sukamaju, Kecamatan Cikaret"
                class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
            />
        </div>

        <!-- JUMLAH PESERTA -->
        <div>
            <label for="jumlahPeserta" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                <Users class="w-3 h-3" /> Jumlah Peserta <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input
                    id="jumlahPeserta"
                    name="jumlahPeserta"
                    type="number"
                    required
                    min="1"
                    value={form?.values?.jumlahPeserta ?? ''}
                    placeholder="Contoh: 15"
                    class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-mono"
                />
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span class="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Orang</span>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-3">
                <div class="relative">
                    <input name="jumlahLaki" type="number" min="0" placeholder="Laki-laki"
                        class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-mono placeholder:font-normal placeholder:text-zinc-400" />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-[9px] font-bold text-blue-400 uppercase tracking-widest">L</span>
                    </div>
                </div>
                <div class="relative">
                    <input name="jumlahPerempuan" type="number" min="0" placeholder="Perempuan"
                        class="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-mono placeholder:font-normal placeholder:text-zinc-400" />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-[9px] font-bold text-pink-400 uppercase tracking-widest">P</span>
                    </div>
                </div>
            </div>
            <p class="text-[10px] text-zinc-400 mt-1.5">Opsional — data terpilah gender.</p>
        </div>

        <!-- DESKRIPSI -->
        <div>
            <label for="deskripsiKegiatan" class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Deskripsi & Hasil Kegiatan <span class="text-rose-500">*</span>
            </label>
            <textarea
                id="deskripsiKegiatan"
                name="deskripsiKegiatan"
                required
                rows="6"
                placeholder="Deskripsikan proses kegiatan, poin-poin utama, dan hasil pertemuan..."
                class="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all resize-y leading-relaxed"
            >{form?.values?.deskripsiKegiatan ?? ''}</textarea>
        </div>

        <!-- DOKUMENTASI -->
        <div class="pt-6 border-t border-zinc-100">
            <h3 class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                <Upload class="w-3 h-3" /> Dokumentasi (Opsional)
            </h3>
            <p class="text-[10px] text-zinc-400 mb-4">Maks. 10 file. Format: Gambar, PDF, ZIP, Word (.docx), Excel (.xlsx). Ukuran maks. 20 MB/file.</p>

            <div class="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center hover:bg-zinc-50/50 transition-colors relative">
                <input
                    type="file"
                    name="berkas"
                    id="berkasInput"
                    multiple
                    accept={FILE_ACCEPT}
                    bind:this={fileInput}
                    onchange={onFileChange}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FilePlus2 class="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p class="text-sm font-bold text-zinc-700">Pilih atau letakkan file di sini</p>
                <div class="flex items-center justify-center flex-wrap gap-3 mt-2">
                    <span class="text-[10px] text-zinc-400 font-medium">📷 Gambar</span>
                    <span class="text-[10px] text-zinc-400 font-medium">📄 PDF</span>
                    <span class="flex items-center gap-1 text-[10px] text-zinc-400 font-medium"><FileArchive class="w-3 h-3" /> ZIP</span>
                    <span class="text-[10px] text-zinc-400 font-medium">📝 Word</span>
                    <span class="flex items-center gap-1 text-[10px] text-zinc-400 font-medium"><FileSpreadsheet class="w-3 h-3" /> Excel</span>
                </div>
            </div>

            {#if selectedFiles.length > 0}
                <div class="mt-4 space-y-2">
                    {#each selectedFiles as file, index}
                        {@const fileType = getFileIcon(file)}
                        <div class="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl shadow-sm">
                            <div class="flex items-center gap-3 truncate">
                                <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0
                                    {fileType === 'img' ? 'bg-blue-50 text-blue-600' :
                                     fileType === 'pdf' ? 'bg-rose-50 text-rose-600' :
                                     fileType === 'zip' ? 'bg-amber-50 text-amber-600' :
                                     fileType === 'doc' ? 'bg-indigo-50 text-indigo-600' :
                                     fileType === 'xls' ? 'bg-emerald-50 text-emerald-600' :
                                     'bg-zinc-100 text-zinc-500'}">
                                    {file.name.split('.').pop()?.substring(0,4)}
                                </span>
                                <div class="truncate">
                                    <p class="text-xs font-bold text-zinc-800 truncate">{file.name}</p>
                                    <p class="text-[10px] font-mono text-zinc-400">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button type="button" onclick={() => removeFile(index)}
                                class="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none shrink-0 ml-2 text-xs font-bold">
                                Hapus
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-end gap-4">
            <a href="/laporan" class="px-5 py-2.5 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-900 transition-colors">Batal</a>
            <button
                type="submit"
                disabled={loading || !selectedBidangId}
                class="px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
                {#if loading}Harap Tunggu...{:else}<Check class="w-4 h-4" /> Kirim Laporan{/if}
            </button>
        </div>
    </form>
</div>