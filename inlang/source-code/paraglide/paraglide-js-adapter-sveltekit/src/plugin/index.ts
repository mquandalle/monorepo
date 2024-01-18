import { paraglide as vitePluginParaglide } from "@inlang/paraglide-js-adapter-vite"
import { preprocess, type PreprocessorConfig } from "./preprocessor/index.js"
import { type UserConfig, type Config, resolveConfig } from "./config.js"
import fs from "node:fs/promises"
import path from "node:path"
import type { Plugin } from "vite"

declare global {
	interface ImportMeta {
		dirname: string
		filename: string
	}
}

const files = await getExtraFiles(path.resolve(import.meta.dirname, "./extra-files"))

// Vite's Plugin type is often incompatible between vite versions, so we use any here
export function paraglide(userConfig: UserConfig): any {
	const config = resolveConfig(userConfig)
	const plugins: Plugin[] = [vitePluginParaglide({ ...config, extraFiles: processFiles(files) })]

	if (!config.disablePreprocessor) {
		plugins.push(registerPreprocessor(config))
	}

	return plugins
}

function processFiles(files: Record<string, string>): Record<string, string> {
	//remove the .template extension from all files
	return Object.fromEntries(
		Object.entries(files).map(([fileName, fileContent]) => [
			fileName.replace(".template", ""),
			fileContent,
		])
	)
}

//read the ./extra-files directory and return a map of file names to file contents
async function getExtraFiles(extraFilesDir: string): Promise<Record<string, string>> {
	const files = await fs.readdir(extraFilesDir)
	const fileContents = await Promise.all(
		files.map(async (fileName) => {
			const filePath = `${extraFilesDir}/${fileName}`
			const fileContent = await fs.readFile(filePath, "utf-8")
			return [fileName, fileContent]
		})
	)
	return Object.fromEntries(fileContents)
}

/**
 * This plugin registers the preprocessor with Svelte.
 */
function registerPreprocessor(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	config: Config
): Plugin {
	const preprocessConfig: PreprocessorConfig = {}
	return {
		name: "paraglide-js-adapter-sveltekit-register-preprocessor",
		api: {
			//The Svelte vite-plugin looks for this and automatically adds it to the preprocess array
			sveltePreprocess: preprocess(preprocessConfig),
		},
	}
}
