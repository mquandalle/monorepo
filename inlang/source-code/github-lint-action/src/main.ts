import * as fs from "node:fs/promises"
import * as core from "@actions/core"
import * as github from "@actions/github"
import { openRepository, findRepoRoot } from "@lix-js/client"
import { loadProject, type MessageLintReport } from "@inlang/sdk"

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
	console.log("Running the action")

	try {
		const token: string = core.getInput("token", { required: true })
		const project_path: string = core.getInput("project_path", { required: true })
		const { owner, repo } = github.context.repo
		const pr_number = github.context.payload.pull_request?.number

		const baseDirectory = process.cwd()
		const absoluteProjectPath = baseDirectory + project_path
		const repoRoot = await findRepoRoot({ nodeishFs: fs, path: absoluteProjectPath })

		if (!repoRoot) {
			console.log(
				`Could not find repository root for path ${project_path}, falling back to direct fs access`
			)
			return
		}

		const inlangRepo = await openRepository(repoRoot, {
			nodeishFs: fs,
		})
		console.log("Merge origin: ", inlangRepo.origin)
		console.log("merge base: ", github.context.payload.pull_request?.base.label)

		const project = await loadProject({
			projectPath: absoluteProjectPath,
			repo: inlangRepo,
			appId: "app.inlang.githubI18nLintAction",
		})

		if (project.errors().length > 0) {
			for (const error of project.errors()) {
				throw error
			}
		}

		const lintSummary = createLintSummary(project.query.messageLintReports.getAll())

		// checkout main branch
		const repoMain = await openRepository(repoRoot, {
			nodeishFs: fs,
			branch: github.context.payload.pull_request?.base.ref,
		})
		const projectMain = await loadProject({
			projectPath: absoluteProjectPath,
			repo: repoMain,
			appId: "app.inlang.githubI18nLintAction",
		})

		if (projectMain.errors().length > 0) {
			for (const error of projectMain.errors()) {
				throw error
			}
		}

		const lintSummaryMain = createLintSummary(projectMain.query.messageLintReports.getAll())
		console.log(lintSummaryMain)

		if (JSON.stringify(lintSummary) === JSON.stringify(lintSummaryMain)) {
			console.log("No changes in linting errors")
			return
		}

		const commentContent = `
				Pull Request #${pr_number} has been updated with: \n
				- ${lintSummary.errors} errors \n
				- ${lintSummary.warnings} warnings \n
			`
		console.log(`I'm going to comment on the PR with:`, commentContent)
		// await octokit.rest.issues.createComment({
		// 	owner,
		// 	repo,
		// 	issue_number: pr_number,
		// 	body: commentContent,
		// })
		core.setOutput("comment_content", commentContent)
	} catch (error) {
		// Fail the workflow run if an error occurs
		console.log(error)
		if (error instanceof Error) core.setFailed(error.message)
	}
}

function createLintSummary(reports: MessageLintReport[]) {
	return reports.reduce(
		(acc, report: MessageLintReport) => {
			acc.errors += report.level === "error" ? 1 : 0
			acc.warnings += report.level === "warning" ? 1 : 0
			return acc
		},
		{ errors: 0, warnings: 0 }
	)
}

export default run
