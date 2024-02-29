import type { NodeishFilesystem } from "@lix-js/fs"
import type { Repository, LixError } from "./api.js"
import { transformRemote, withProxy, parseLixUri } from "./helpers.js"
// @ts-ignore
import { makeHttpClient } from "./git-http/client.js"
import { optimizedRefsRes, optimizedRefsReq } from "./git-http/optimize-refs.js"
import { Octokit } from "octokit"

import { createSignal, createEffect } from "./solid.js"

import type { OptStatus } from "./git/status.js"
import { commit as lixCommit } from "./git/commit.js"
import { status as lixStatus } from "./git/status.js"
import isoGit from "isomorphic-git"
import { modeToFileType } from "./git/helpers.js"

// TODO: --filter=tree:0 for commit history?
const {
	TREE,
	clone,
	listRemotes,
	push,
	walk,
	currentBranch,
	log,
	listServerRefs,
	checkout,
	addRemote,
	fetch: gitFetch,
	commit: isoCommit,
	findRoot,
	merge,
	isIgnored,
} = isoGit

const whitelistedExperimentalRepos = [
	"inlang/example",
	"inlang/ci-test-repo",
	"opral/monorepo",
	"inlang/example-test",

	"janfjohannes/inlang-example",
	"janfjohannes/cal.com",

	"niklasbuchfink/appflowy",
]

export async function findRepoRoot(args: {
	nodeishFs: NodeishFilesystem
	path: string
}): Promise<string | undefined> {
	const gitroot = await findRoot({
		fs: args.nodeishFs,
		filepath: args.path,
	}).catch(() => undefined)

	return gitroot ? "file://" + gitroot : undefined
}

export async function openRepository(
	url: string,
	args: {
		author?: any
		nodeishFs?: NodeishFilesystem
		workingDirectory?: string
		branch?: string
		auth?: unknown // unimplemented

		// Do not expose experimental arg types
		[x: string]: any
		// sparseFilter?: any
		// debug?: boolean
		// experimentalFeatures?: {
		// 	lixFs?: boolean
		// 	lazyClone?: boolean
		// 	lixCommit?: boolean
		// }
	}
): Promise<Repository> {
	const rawFs = args.nodeishFs || (await import("@lix-js/fs")).createNodeishMemoryFs()
	const author = args.author

	let debug: boolean
	// eslint-disable-next-line prefer-const -- used for development
	debug = args.debug || false

	if (
		!url ||
		(!url.startsWith("file://") && !url.startsWith("https://") && !url.startsWith("http://"))
	) {
		throw new Error("repo url is required, use file:// for local repos")
	}

	if (debug && typeof window !== "undefined") {
		// @ts-ignore
		window["rawFs"] = rawFs
	}

	// fixme: propper error handling with error return values and no signal dependency
	const [errors, setErrors] = createSignal<Error[]>([])

	// TODO: use propper shallow .git format and checks

	// the url format for lix urls is
	// https://lix.inlang.com/git/github.com/opral/monorepo
	// proto:// lixServer / namespace / repoHost / owner / repoName
	// namespace is ignored until switching from git.inlang.com to lix.inlang.com and can eveolve in future to be used for repoType, api type or feature group
	// the url format for direct github urls without a lix server is https://github.com/inlang/examplX (only per domain-enabled git hosters will be supported, currently just gitub)
	// the url for opening a local repo allready in the fs provider is file://path/to/repo (not implemented yet)

	// TODO: check for same origin
	let freshClone = false

	let branchName = args.branch

	// the directory we use for all git operations as repo root, if we are interested in a repo subdirectory we have to append this
	// TODO: add more tests for non root dir command
	let dir = "/"

	if (url.startsWith("file:")) {
		dir = url.replace("file://", "")

		const remotes = await listRemotes({
			fs: rawFs,
			dir: url.replace("file://", ""),
		}).catch(() => [])
		const origin = remotes.find(({ remote }) => remote === "origin")?.url || ""

		if (origin.startsWith("git@github.com:")) {
			url = origin.replace("git@github.com:", "https://github.com/")
		} else {
			url = origin
		}
	} else {
		// Simple check for existing git repos
		const maybeGitDir = await rawFs.stat(".git").catch((error: any) => ({ error }))
		if ("error" in maybeGitDir) {
			freshClone = true
		}
	}

	const { protocol, lixHost, repoHost, owner, repoName, username, password } = parseLixUri(url)
	if (debug && (username || password)) {
		console.warn(
			"username and password and providers other than github are not supported yet. Only local commands will work."
		)
	}

	const isWhitelistedRepo = whitelistedExperimentalRepos.includes(
		`${owner}/${repoName}`.toLocaleLowerCase()
	)
	const experimentalFeatures =
		args.experimentalFeatures || (isWhitelistedRepo ? { lazyClone: true, lixCommit: true } : {})
	const lazyFS = freshClone || experimentalFeatures.lazyClone
	const cache = lazyFS ? {} : undefined

	const gitProxyUrl = lixHost ? `${protocol}//${lixHost}/git-proxy` : ""
	const gitHubProxyUrl = lixHost ? `${protocol}//${lixHost}/github-proxy` : ""

	const github = new Octokit({
		request: {
			fetch: (...ghArgs: any) => {
				ghArgs[0] = gitHubProxyUrl + "/" + ghArgs[0]
				if (!ghArgs[1]) {
					ghArgs[1] = {}
				}

				if (gitHubProxyUrl) {
					// required for authenticated cors requests
					ghArgs[1].credentials = "include"
				}

				// @ts-ignore
				return fetch(...ghArgs)
			},
		},
	})

	// TODO: support for url scheme to use local repo already in the fs
	const gitUrl = repoName ? `https://${repoHost}/${owner}/${repoName}` : ""

	if (!gitUrl) {
		console.warn("valid repo url / local repo not found, only limited features will be available.")
	}

	const expFeatures = Object.entries(experimentalFeatures) // eslint-disable-next-line @typescript-eslint/no-unused-vars
		.filter(([_, value]) => value)
		.map(([key]) => key)
	if (expFeatures.length) {
		console.warn("using experimental git features for this repo.", expFeatures)
	}

	// Bail commit/ push on errors that are relevant or unknown

	let pending: Promise<void | { error: Error }> | undefined
	const checkedOut = new Set()
	let nextBatch: string[] = []
	async function doCheckout() {
		if (nextBatch.length < 1) {
			return
		}
		const thisBatch = [...nextBatch]
		nextBatch = []
		if (debug) {
			console.warn("checking out ", thisBatch)
		}

		for (const placeholder of thisBatch.filter((entry) => rawFs._isPlaceholder(entry))) {
			await rawFs.rm(placeholder)

			// if file is in stage but not workdir, isogit will not checkout file but assume its deleted
			// CHECK if still reqired, as stage for placeholder is empty
			// await isoGit.remove({
			// 	fs: withProxy({
			// 		nodeishFs: rawFs,
			// 		verbose: debug,
			// 		description: "lazy checkout",
			// 	}),
			// 	dir,
			// 	cache,
			// 	filepath: placeholder,
			// })
		}

		for (const entry of thisBatch) {
			checkedOut.add(entry)
		}
		// console.info("checking out", thisBatch)
		const res = await checkout({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: debug ? "checkout: " + JSON.stringify(thisBatch) : "checkout",
			}),
			dir,
			cache,
			ref: args.branch,
			filepaths: thisBatch,
		}).catch((error) => {
			console.error({ error, thisBatch })
		})
		// console.info("checked out", thisBatch)

		if (debug) {
			console.warn("checked out ", thisBatch)
		}

		if (nextBatch.length) {
			// console.warn("next batch", nextBatch)
			return doCheckout()
		}

		pending = undefined
		return res
	}

	async function checkOutPlaceholders() {
		if (!experimentalFeatures.lazyClone) {
			return
		}
		await checkout({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "checkout",
			}),
			cache,
			dir,
			ref: branchName,
			filepaths: [".gitignore"],
		})
		checkedOut.add(".gitignore")

		const fs = withProxy({ nodeishFs: rawFs, verbose: debug, description: "checkout placeholders" })
		await walk({
			fs,
			dir,
			cache: cache, //  || {},
			gitdir: ".git",
			trees: [TREE({ ref: args.branch })],
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			map: async function (fullpath, [commit]) {
				if (!commit) {
					return undefined
				}
				const fileMode = await commit.mode()

				const fileType: string = modeToFileType(fileMode)

				if (
					args.sparseFilter &&
					!args.sparseFilter({
						filename: fullpath,
						type: fileType,
					})
				) {
					return undefined
				}

				if (fileType === "folder" && !checkedOut.has(fullpath)) {
					return fullpath
				}

				if (fileType === "file" && !checkedOut.has(fullpath)) {
					try {
						await fs._createPlaceholder(fullpath, { mode: fileMode })
					} catch (err) {
						console.warn(err)
					}

					return fullpath
				}

				if (fileType === "symlink" && !checkedOut.has(fullpath)) {
					try {
						await fs._createPlaceholder(fullpath, { mode: fileMode })
					} catch (err) {
						console.warn(err)
					}

					return fullpath
				}

				return undefined
			},
		})
		pending && (await pending)
	}

	if (freshClone) {
		console.info("Using lix for cloning repo")

		await clone({
			fs: withProxy({ nodeishFs: rawFs, verbose: debug, description: "clone" }),
			http: makeHttpClient({
				debug,
				description: "clone",

				onReq: ({ url, body }: { url: string; body: any }) => {
					return optimizedRefsReq({ url, body, addRef: branchName })
				},

				onRes: optimizedRefsRes,
			}),
			dir,
			cache,
			corsProxy: gitProxyUrl,
			url: gitUrl,
			singleBranch: true,
			noCheckout: experimentalFeatures.lazyClone,
			ref: branchName,

			// TODO: use only first and last commit in lazy clone? (we need first commit for repo id)
			depth: 1,
			noTags: true,
		})
			.then(() => checkOutPlaceholders())
			.finally(() => {
				pending = undefined
			})
			.catch((newError: Error) => {
				setErrors((previous) => [...(previous || []), newError])
			})
	} else {
		console.info("Using existing cloned repo")
	}

	// delay all fs and repo operations until the repo clone and checkout have finished, this is preparation for the lazy feature
	function delayedAction({
		execute,
		prop,
		argumentsList,
	}: {
		execute: () => any
		prop: any
		argumentsList: any[]
	}) {
		const filename = argumentsList?.[0]?.replace(/^(\.)?(\/)?\//, "")
		const pathParts = filename?.split("/") || []
		const rootObject = pathParts[0]

		if (
			experimentalFeatures.lazyClone &&
			rootObject &&
			rootObject !== ".git" &&
			filename !== ".gitignore" &&
			["readFile", "readlink", "writeFile"].includes(prop) &&
			!checkedOut.has(rootObject) &&
			!checkedOut.has(filename)
		) {
			if (debug) {
				console.warn("delayedAction", {
					prop,
					argumentsList,
					rootObject,
					checkedOut,
					filename,
					pending,
					nextBatch,
				})
			}
			// TODO: optimize writes? only needs adding the head hash to staging instead of full checkout....
			// if (prop === "writeFile") {
			// 	checkedOut.add(filename)
			// } else {

			nextBatch.push(filename)

			// }

			//  && nextBatch.length > 0
			if (!pending) {
				pending = doCheckout()
			}
		} else {
			// excluded files execute immediately without waiting for other lazy actions either
			return execute()
		}

		if (pending) {
			return pending.then(execute).finally(() => {
				if (debug) {
					console.warn("executed", filename, prop)
				}
			})
		}

		return execute()
	}

	const nodeishFs = withProxy({
		nodeishFs: rawFs,
		verbose: debug,
		description: "app",
		intercept: lazyFS ? delayedAction : undefined,
	})

	const add = (filepath: string | string[]) =>
		isoGit.add({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "add",
			}),
			parallel: true,
			dir,
			cache,
			filepath,
		})

	const remove = (filepath: string) =>
		isoGit.remove({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "remove",
			}),
			dir,
			cache,
			filepath,
		})

	async function emptyWorkdir() {
		const statusResult = await statusList()
		if (statusResult.length > 0) {
			throw new Error("could not pull, uncommitted changes")
		}

		const listing = (await rawFs.readdir("/")).filter((entry) => {
			return !checkedOut.has(entry) && entry !== ".git" && entry !== ".gitignore"
		})

		const notIgnored = (
			await Promise.all(
				listing.map((entry) =>
					isIgnored({ fs: rawFs, dir, filepath: entry }).then((ignored) => {
						return { ignored, entry }
					})
				)
			)
		)
			.filter(({ ignored }) => !ignored)
			.map(({ entry }) => entry)

		for (const toDelete of notIgnored) {
			await rawFs.rm(toDelete, { recursive: true }).catch(() => {})

			await isoGit.remove({
				fs: rawFs,
				// ref: args.branch,
				dir: "/",
				cache,
				filepath: toDelete,
			})
		}
	}

	type StatusArgs = {
		// ref?: string support custom refs
		filepaths?: string[]
		filter?: (filepath: string) => boolean
		sparseFilter?: (entry: { filename: string; type: "file" | "folder" }) => boolean
		includeStatus?: OptStatus[]
	}
	async function statusList(statusArg?: StatusArgs): ReturnType<typeof lixStatus> {
		return lixStatus({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "lixStatus",
			}),
			dir,
			cache,
			sparseFilter: args?.sparseFilter,
			filter: statusArg?.filter,
			filepaths: statusArg?.filepaths,
			includeStatus: statusArg?.includeStatus,
		})
	}

	async function status(statusArg: string) {
		if (typeof statusArg !== "string") {
			throw new Error("parameter must be a string")
		}
		const statusList = await lixStatus({
			fs: withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "lixStatus",
			}),
			dir,
			cache,
			sparseFilter: args.sparseFilter,
			filepaths: [statusArg],
		})

		const maybeStatusEntry: [string, string] = statusList[0] || [statusArg, "unknown"]
		return maybeStatusEntry?.[1] as string
	}

	return {
		_experimentalFeatures: experimentalFeatures,
		_rawFs: rawFs,
		_emptyWorkdir: emptyWorkdir,
		_checkOutPlaceholders: checkOutPlaceholders,
		_add: add,
		_remove: remove,
		// @ts-ignore
		_isoCommit: ({ author: overrideAuthor, message }) =>
			isoCommit({
				fs: withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "iso commit",
				}),
				dir,
				cache,
				author: overrideAuthor || author,
				message: message,
			}),

		nodeishFs,

		...(experimentalFeatures.lixFs
			? {
					read(path: string) {
						return nodeishFs.readFile(path, { encoding: "utf-8" })
					},
					write(path: string, content: string) {
						return nodeishFs.writeFile(path, content)
					},
					listDir(path: string) {
						return nodeishFs.readdir(path)
					},
			  }
			: {}),

		/**
		 * Gets the git origin url of the current repository.
		 *
		 * @returns The git origin url or undefined if it could not be found.
		 */
		async listRemotes() {
			try {
				const withProxypedFS = withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "listRemotes",
					intercept: delayedAction,
				})

				const remotes = await listRemotes({
					fs: withProxypedFS,
					dir,
				})

				return remotes
			} catch (_err) {
				return undefined
			}
		},

		async checkout({ branch }: { branch: string }) {
			branchName = branch

			if (lazyFS) {
				throw new Error(
					"not implemented for lazy lix mode yet, use openRepo with different branch instead"
				)
			}

			await checkout({
				fs: withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "checkout",
				}),
				cache,
				dir,
				ref: branchName,
			})
		},

		status,

		statusList,

		async forkStatus() {
			// uncomment to disable: return { ahead: 0, behind: 0, conflicts: false }
			const repo = await this

			const { isFork, parent } = (await repo.getMeta()) as {
				isFork: boolean
				parent: { url: string }
			}

			if (!isFork) {
				return { error: "could not get fork upstream or repo not a fork" }
			}

			const forkFs = withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "forkStatus",
				intercept: delayedAction,
			})

			const useBranchName = await isoGit.currentBranch({
				fs: forkFs,
				dir,
				fullname: false,
			})

			if (!useBranchName) {
				return { error: "could not get fork status for detached head" }
			}

			await addRemote({
				dir,
				remote: "upstream",
				url: "https://" + parent.url,
				fs: forkFs,
			})

			try {
				await gitFetch({
					depth: 1,
					singleBranch: true,
					dir,
					cache,
					ref: useBranchName,
					remote: "upstream",
					http: makeHttpClient({ debug, description: "forkStatus" }),
					fs: forkFs,
				})
			} catch (err) {
				return { error: err }
			}

			const currentUpstreamCommit = await isoGit.resolveRef({
				fs: forkFs,
				dir: "/",
				ref: "upstream/" + useBranchName,
			})

			const currentOriginCommit = await isoGit.resolveRef({
				fs: forkFs,
				dir: "/",
				ref: useBranchName,
			})

			if (currentUpstreamCommit === currentOriginCommit) {
				return { ahead: 0, behind: 0, conflicts: false }
			}

			const res: Promise<
				| Awaited<
						ReturnType<typeof github.request<"GET /repos/{owner}/{repo}/compare/{base}...{head}">>
				  >
				| { error: any }
			> = github
				.request("GET /repos/{owner}/{repo}/compare/{base}...{head}", {
					owner,
					repo: repoName,
					base: currentUpstreamCommit,
					head: currentOriginCommit,
				})
				.catch((newError: Error) => {
					setErrors((previous) => [...(previous || []), newError])
					return { error: newError }
				})

			const compare = await res

			if ("error" in compare || !("data" in compare)) {
				return { error: compare.error || "could not diff repos on github" }
			}

			await gitFetch({
				depth: compare.data.behind_by + 1,
				remote: "upstream",

				singleBranch: true,
				dir,
				ref: useBranchName,
				http: makeHttpClient({ debug, description: "forkStatus" }),
				fs: forkFs,
			})

			await gitFetch({
				depth: compare.data.ahead_by + 1,

				singleBranch: true,
				ref: useBranchName,
				dir,
				http: makeHttpClient({ debug, description: "forkStatus" }),
				corsProxy: gitProxyUrl,
				fs: forkFs,
			})

			let conflicts = false
			try {
				await merge({
					fs: forkFs,
					cache,
					author: { name: "lix" },
					dir,
					ours: useBranchName,
					dryRun: true,
					theirs: "upstream/" + useBranchName,
					noUpdateBranch: true,
					abortOnConflict: true,
				})
			} catch (err) {
				conflicts = true
			}
			return { ahead: compare.data.ahead_by, behind: compare.data.behind_by, conflicts }
		},

		async commit({
			author: overrideAuthor,
			message,
			include,
		}: // TODO: exclude,
		{
			author?: any
			message: string
			include: string[]
			// exclude: string[]
		}) {
			if (include) {
				const additions: string[] = []
				const deletions: string[] = []

				for (const entry of include) {
					if (await rawFs.lstat(entry).catch(() => undefined)) {
						additions.push(entry)
					} else {
						deletions.push(entry)
					}
				}

				additions.length && (await add(additions))
				deletions.length && (await Promise.all(deletions.map((del) => remove(del))))
			} else {
				// TODO: commit all
			}

			const commitArgs = {
				fs: withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "commit",
					intercept: delayedAction,
				}),
				dir,
				cache,
				author: overrideAuthor || author,
				message: message,
			}

			if (experimentalFeatures.lixCommit) {
				console.warn("using experimental commit for this repo.")
				return lixCommit(commitArgs)
			} else {
				return isoCommit(commitArgs)
			}
		},

		push() {
			return push({
				fs: withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "push",
					intercept: delayedAction,
				}),
				url: gitUrl,
				cache,
				corsProxy: gitProxyUrl,
				http: makeHttpClient({ debug, description: "push" }),
				dir,
			})
		},

		async pull(cmdArgs) {
			const pullFs = withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "pull",
				intercept: delayedAction,
			})

			const { fetchHead, fetchHeadDescription } = await gitFetch({
				depth: 5, // TODO: how to handle depth with upstream? reuse logic from fork sync
				fs: pullFs,
				cache,
				http: makeHttpClient({ verbose: debug, description: "pull" }),
				corsProxy: gitProxyUrl,
				ref: branchName,
				tags: false,
				dir,
				url: gitUrl,
				// remote: "origin",
				// remoteRef,
				singleBranch: cmdArgs?.singleBranch || true,
			})

			if (!fetchHead) {
				throw new Error("could not fetch head")
			}

			await merge({
				fs: pullFs,
				cache,
				dir,
				ours: branchName,
				theirs: fetchHead,
				fastForward: cmdArgs?.fastForward,
				message: `Merge ${fetchHeadDescription}`,
				author: cmdArgs?.author || author,
				dryRun: false,
				noUpdateBranch: false,
				// committer,
				// signingKey,
				// fastForwardOnly,
			})

			if (experimentalFeatures.lazyClone) {
				console.warn(
					"enableExperimentalFeatures.lazyClone is set for this repo but pull not fully implemented. disabling lazy files"
				)

				await emptyWorkdir()

				await checkout({
					fs: rawFs,
					cache,
					dir,
					ref: branchName,
					noCheckout: false,
				})
			} else {
				await checkout({
					fs: rawFs,
					cache,
					dir,
					ref: branchName,
					noCheckout: false,
				})
			}
		},

		log(cmdArgs = {}) {
			return log({
				fs: withProxy({
					nodeishFs: rawFs,
					verbose: debug,
					description: "log",
					intercept: delayedAction,
				}),
				depth: cmdArgs.depth,
				filepath: cmdArgs.filepath,
				dir,
				ref: cmdArgs.ref,
				cache,
				since: cmdArgs.since,
			})
		},

		async mergeUpstream(cmdArgs) {
			const branch =
				cmdArgs?.branch ||
				(await isoGit.currentBranch({
					fs: withProxy({
						nodeishFs: rawFs,
						verbose: debug,
						description: "mergeUpstream",
						intercept: delayedAction,
					}),
					dir,
					fullname: false,
				}))
			if (typeof branch !== "string") {
				throw "could not get current branch"
			}

			let response
			try {
				response = await github.request("POST /repos/{owner}/{repo}/merge-upstream", {
					branch,
					owner,
					repo: repoName,
				})
			} catch (error) {
				return { error }
			}

			return response?.data
		},

		async createFork() {
			return github.rest.repos.createFork({
				owner,
				repo: repoName,
			})
		},

		/**
		 * Parses the origin from remotes.
		 *
		 * The function ensures that the same orgin is always returned for the same repository.
		 */
		async getOrigin(): Promise<string | undefined> {
			// TODO: this flow is obsolete and can be unified with the initialization of the repo
			const repo = await this
			const remotes: Array<{ remote: string; url: string }> | undefined = await repo.listRemotes()

			const origin = remotes?.find((elements) => elements.remote === "origin")
			if (origin === undefined) {
				return undefined
			}
			// polyfill for some editor related origin issues
			let result = origin.url
			if (result.endsWith(".git") === false) {
				result += ".git"
			}

			return transformRemote(result)
		},

		async getCurrentBranch() {
			// TODO: make stateless?
			return (
				(await currentBranch({
					fs: withProxy({
						nodeishFs: rawFs,
						verbose: debug,
						description: "getCurrentBranch",
						intercept: delayedAction,
					}),
					dir,
				})) || undefined
			)
		},

		async getBranches() {
			const serverRefs = await listServerRefs({
				url: gitUrl,
				corsProxy: gitProxyUrl,
				prefix: "refs/heads",
				http: makeHttpClient({ verbose: debug, description: "getBranches" }),
			}).catch((error) => {
				return { error }
			})

			if ("error" in serverRefs) {
				return undefined
			}

			return (
				serverRefs
					.filter((ref) => !ref.ref.startsWith("refs/heads/gh-readonly-queue/"))
					.map((ref) => ref.ref.replace("refs/heads/", "")) || undefined
			)
		},

		errors: Object.assign(errors, {
			subscribe: (callback: (value: LixError[]) => void) => {
				createEffect(() => {
					// TODO: the subscription should not send the whole array but jsut the new errors
					// const maybeLastError = errors().at(-1)
					const allErrors = errors()
					if (allErrors.length) {
						callback(allErrors)
					}
				})
			},
		}),

		async getFirstCommitHash() {
			const getFirstCommitFs = withProxy({
				nodeishFs: rawFs,
				verbose: debug,
				description: "getFirstCommitHash",
				intercept: delayedAction,
			})

			if (lazyFS) {
				try {
					await gitFetch({
						singleBranch: true,
						dir,
						depth: 2147483647, // the magic number for all commits
						http: makeHttpClient({ verbose: debug, description: "getFirstCommitHash" }),
						corsProxy: gitProxyUrl,
						fs: getFirstCommitFs,
					})
				} catch {
					return undefined
				}
			}

			let firstCommitHash: string | undefined = "HEAD"
			for (;;) {
				const commits: Awaited<ReturnType<typeof log>> | { error: any } = await log({
					fs: getFirstCommitFs,
					depth: 550,
					dir,
					ref: firstCommitHash,
				}).catch((error) => {
					return { error }
				})

				if ("error" in commits) {
					firstCommitHash = undefined
					break
				}

				const lastHashInPage: undefined | string = commits.at(-1)?.oid
				if (lastHashInPage) {
					firstCommitHash = lastHashInPage
				}

				if (commits.length < 550) {
					break
				}
			}

			return firstCommitHash
		},

		/**
		 * Additional information about a repository provided by GitHub.
		 */
		async getMeta() {
			const res: Awaited<
				ReturnType<typeof github.request<"GET /repos/{owner}/{repo}">> | { error: Error }
			> = await github
				.request("GET /repos/{owner}/{repo}", {
					owner,
					repo: repoName,
				})
				.catch((newError: Error) => {
					setErrors((previous) => [...(previous || []), newError])
					return { error: newError }
				})

			if ("error" in res) {
				return { error: res.error }
			} else {
				return {
					name: res.data.name,
					isPrivate: res.data.private,
					isFork: res.data.fork,
					permissions: {
						admin: res.data.permissions?.admin || false,
						push: res.data.permissions?.push || false,
						pull: res.data.permissions?.pull || false,
					},
					owner: {
						name: res.data.owner.name || undefined,
						email: res.data.owner.email || undefined,
						login: res.data.owner.login,
					},
					parent: res.data.parent
						? {
								url: transformRemote(res.data.parent.git_url),
								fullName: res.data.parent.full_name,
						  }
						: undefined,
				}
			}
		},
	}
}
