import { beforeEach, describe, expect, it, vi } from "vitest"
import { window } from "vscode"
import { extractMessageCommand } from "./extractMessage.js"
import { state } from "../utilities/state.js"
import { msg } from "../utilities/messages/msg.js"
import { CONFIGURATION } from "../configuration.js"

vi.mock("vscode", () => ({
	commands: {
		registerTextEditorCommand: vi.fn(),
	},
	window: {
		showInputBox: vi.fn(),
		showQuickPick: vi.fn(),
		showErrorMessage: vi.fn(),
	},
	env: {
		openExternal: vi.fn(),
	},
	Uri: {
		parse: vi.fn(),
	},
}))

vi.mock("../utilities/state.js", () => ({
	state: vi.fn(),
}))

vi.mock("../utilities/messages/msg.js", () => ({
	msg: vi.fn(),
}))

vi.mock("../services/telemetry/index.js", () => ({
	telemetry: {
		capture: vi.fn(),
	},
}))

vi.mock("../configuration.js", () => ({
	CONFIGURATION: {
		EVENTS: {
			ON_DID_EXTRACT_MESSAGE: { fire: vi.fn() },
		},
	},
}))

describe("extractMessageCommand", () => {
	let mockTextEditor: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockTextEditor = {
			document: {
				getText: vi.fn().mockReturnValue("Sample Text"),
			},
			selection: {},
			edit: vi.fn().mockResolvedValue(true),
		}
		vi.mocked(state).mockReturnValue({
			project: {
				// @ts-expect-error
				customApi: vi.fn(() => ({
					"app.inlang.ideExtension": {
						extractMessageOptions: [
							{
								callback: vi.fn(() => ({
									messageId: "test",
									messageReplacement: "Test Replacement",
								})),
							},
							// Additional options if needed
						],
					},
				})),
				// @ts-expect-error
				settings: vi.fn(() => ({
					sourceLanguageTag: "en",
				})),
				query: {
					// @ts-expect-error
					messages: {
						create: vi.fn().mockReturnValue(true),
					},
				},
			},
		})
	})

	it("should handle missing ideExtension configuration", async () => {
		vi.mocked(state).mockReturnValueOnce({
			project: {
				// @ts-expect-error
				customApi: vi.fn(() => ({})),
			},
		})
		await extractMessageCommand.callback(mockTextEditor)
		expect(msg).toHaveBeenCalledWith(
			"There is no `plugin` configuration for the Visual Studio Code extension (Sherlock). One of the `modules` should expose a `plugin` which has `customApi` containing `app.inlang.ideExtension`",
			"warn",
			"notification"
		)
	})

	it("should handle missing extractMessageOptions", async () => {
		vi.mocked(state).mockReturnValueOnce({
			project: {
				// @ts-expect-error
				customApi: vi.fn(() => ({ "app.inlang.ideExtension": {} })),
				// @ts-expect-error
				settings: vi.fn(() => ({ sourceLanguageTag: "en" })),
			},
		})
		await extractMessageCommand.callback(mockTextEditor)
		expect(msg).toHaveBeenCalledWith(
			"The `extractMessageOptions` are not defined in `app.inlang.ideExtension` but required to extract a message.",
			"warn",
			"notification"
		)
	})

	it("should cancel operation if messageId is not provided", async () => {
		vi.mocked(window.showInputBox).mockResolvedValueOnce(undefined)
		await extractMessageCommand.callback(mockTextEditor)
		expect(window.showQuickPick).not.toHaveBeenCalled()
	})

	it("should handle non-existent extract option", async () => {
		vi.mocked(window.showInputBox).mockResolvedValueOnce("test")
		// @ts-expect-error
		vi.mocked(window.showQuickPick).mockResolvedValueOnce("Non-existent option")
		await extractMessageCommand.callback(mockTextEditor)
		expect(msg).toHaveBeenCalledWith(
			"Couldn't find choosen extract option.",
			"warn",
			"notification"
		)
	})

	it("should extract a message successfully", async () => {
		vi.mocked(window.showInputBox).mockResolvedValue("test")
		// @ts-expect-error
		vi.mocked(window.showQuickPick).mockResolvedValue("Test Replacement")

		await extractMessageCommand.callback(mockTextEditor)

		expect(window.showInputBox).toHaveBeenCalled()
		expect(window.showQuickPick).toHaveBeenCalled()
		expect(mockTextEditor.edit).toHaveBeenCalled()
		expect(CONFIGURATION.EVENTS.ON_DID_EXTRACT_MESSAGE.fire).toHaveBeenCalled()
		expect(msg).toHaveBeenCalledWith("Message extracted.")
	})
})
