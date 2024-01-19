const KnownAdapters = ["sveltekit"] as const

export type Adapter = (typeof KnownAdapters)[number]

export function isKnownAdapter(adapter: unknown): adapter is Adapter {
	return KnownAdapters.includes(adapter as any)
}

const adapterImportMap: Record<Adapter, () => Promise<Record<string, string>>> = {
	sveltekit: async () => {
		const { getFiles } = await import("@inlang/paraglide-js-adapter-sveltekit/internal")
		return await getFiles()
	},
}

const cache = new Map<Adapter, Record<string, string>>()

export async function getAdapterFiles(adapter: Adapter): Promise<Record<string, string>> {
	const cached = cache.get(adapter)
	if (cached) return cached

	const files = await adapterImportMap[adapter]()
	cache.set(adapter, files)
	return files
}
