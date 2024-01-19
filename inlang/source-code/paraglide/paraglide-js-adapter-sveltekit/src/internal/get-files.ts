import fs from "fs/promises"
import path from "path"

declare global {
	interface ImportMeta {
		dirname: string
		filename: string
	}
}

export async function getFiles() {
	const files = await getExtraFiles(path.resolve(import.meta.dirname, "./files"))
	return processFiles(files)
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
