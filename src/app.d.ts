// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				idUser: string
				namaLengkap: string
				email: string
				namaRole: string
				idBidang: string | null
				idLokasi: string | null
			} | null
		}
		interface PageData {
			user?: App.Locals['user']
		}
	}
}

export {};
