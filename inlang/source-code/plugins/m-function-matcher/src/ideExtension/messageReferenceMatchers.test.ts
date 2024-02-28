import { describe, expect, it } from "vitest"
import { parse } from "./messageReferenceMatchers.js" // Replace with the actual filename

describe("Paraglide Message Parser", () => {
	it("should match simple m function call", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		m.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 5 },
					end: { line: 3, character: 17 },
				},
			},
		])
	})

	// it should match minified m function call
	it("should match minified m function call", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";m.helloWorld();m.hello_world();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 2, character: 56 },
					end: { line: 2, character: 68 },
				},
			},
			{
				messageId: "hello_world",
				position: {
					start: { line: 2, character: 71 },
					end: { line: 2, character: 84 },
				},
			},
		])
	})

	it("should match m function call with arguments", () => {
		const sourceCode = `
		import * as m from from "../../i18n-generated/messages";
		
		m.someFunction({args1: "", args2: ""}, {languageTag: "en"});
		m.some_function({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "someFunction",
				position: {
					start: { line: 4, character: 5 },
					end: { line: 4, character: 62 },
				},
			},
			{
				messageId: "some_function",
				position: {
					start: { line: 5, character: 5 },
					end: { line: 5, character: 63 },
				},
			},
		])
	})

	it("should match multiple messages", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		
		m.helloWorld();
		m.someFunction({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 4, character: 5 },
					end: { line: 4, character: 17 },
				},
			},
			{
				messageId: "someFunction",
				position: {
					start: { line: 5, character: 5 },
					end: { line: 5, character: 62 },
				},
			},
		])
	})

	it("should match message from multiple namespaces", () => {
		const namespaces = ["frontend", "backend", "example", "other", "project-1"]
		for (const namespace of namespaces) {
			const sourceCode = `
		import * as m from "@inlang/paraglide-js/${namespace}/messages";
		m.helloWorld();
		`
			const result = parse(sourceCode)
			expect(result).toEqual([
				{
					messageId: "helloWorld",
					position: {
						start: { line: 3, character: 5 },
						end: { line: 3, character: 17 },
					},
				},
			])
		}
	})

	it("should match message with no namespace", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		m.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 5 },
					end: { line: 3, character: 17 },
				},
			},
		])
	})

	it("should match mutiple references to @inlang/paraglide-js", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";

		@inlang/paraglide-js
		
		m.helloWorld();
		m.some_function_with_a_long_name({args1: "", args2: ""}, {languageTag: "en"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 6, character: 5 },
					end: { line: 6, character: 17 },
				},
			},
			{
				messageId: "some_function_with_a_long_name",
				position: {
					start: { line: 7, character: 5 },
					end: { line: 7, character: 80 },
				},
			},
		])
	})

	it("should match the m function with an object and the arguments a function call", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		m.helloWorld({args1: someFunction(), args2: otherFunction(), args3: "some string"});
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 5 },
					end: { line: 3, character: 86 },
				},
			},
		])
	})

	// it should match the m function which do have function chaining
	it("should match the m function which do have function chaining", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		m.helloWorld().someFunction().someOtherFunction();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 3, character: 5 },
					end: { line: 3, character: 17 },
				},
			},
		])
	})

	it("should match the m function in a complete file", () => {
		const sourceCode = `
		import { createSignal } from "solid-js"
		import { showToast } from "./Toast.jsx"
		import { rpc } from "@inlang/rpc"
		import * as m from "../../i18n-generated/messages";

		export function NewsletterForm() {
			const [email, setEmail] = createSignal("")
			const [loading, setLoading] = createSignal(false)

			const fetchSubscriber = async (email: any) => {
				setLoading(true)
				const response = await rpc.subscribeNewsletter({ email })
				if (!response.error) {
					if (response.data === "already subscribed") {
						showToast({
							title: "Could not subscribe",
							variant: "success",
							message: m.newsletter_error_alreadySubscribed(),
						})
					} else if (response.data === "success") {
						showToast({
							title: "Success",
							variant: "success",
							message: m.newsletter_success(),
						})
					} else {
						showToast({
							title: "Error",
							variant: "danger",
							message: m.newsletter_error_generic(),
						})
					}
				} else {
					showToast({
						title: "Error",
						variant: "danger",
						message: m.newsletter_error_generic(),
					})
				}

				setLoading(false)
				setEmail("")
			}

			return (
				<div>test</div>
			)
		};
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "newsletter_error_alreadySubscribed",
				position: {
					end: {
						character: 55,
						line: 19,
					},
					start: {
						character: 19,
						line: 19,
					},
				},
			},
			{
				messageId: "newsletter_success",
				position: {
					end: {
						character: 39,
						line: 25,
					},
					start: {
						character: 19,
						line: 25,
					},
				},
			},
			{
				messageId: "newsletter_error_generic",
				position: {
					end: {
						character: 45,
						line: 31,
					},
					start: {
						character: 19,
						line: 31,
					},
				},
			},
			{
				messageId: "newsletter_error_generic",
				position: {
					end: {
						character: 44,
						line: 38,
					},
					start: {
						character: 18,
						line: 38,
					},
				},
			},
		])
	})

	it("should parse function calls without parentheses", () => {
		const sourceCode = `import * as m from 'module';

		const a = {
			b: m.helloWorld,
			c: m.helloWorld(),
			d: m.helloWorld().someFunction(),
			e: m.this_is_a_message123,
		}
		`
		const result = parse(sourceCode)
		expect(result).toEqual([
			{
				messageId: "helloWorld",
				position: {
					start: { line: 4, character: 9 },
					end: { line: 4, character: 19 },
				},
			},
			{
				messageId: "helloWorld",
				position: {
					start: { line: 5, character: 9 },
					end: { line: 5, character: 21 },
				},
			},
			{
				messageId: "helloWorld",
				position: {
					start: { line: 6, character: 9 },
					end: { line: 6, character: 21 },
				},
			},
			{
				messageId: "this_is_a_message123",
				position: {
					start: { line: 7, character: 9 },
					end: { line: 7, character: 29 },
				},
			},
		])
	})

	it("should match if m is defined before the reference to paraglide", () => {
		const sourceCode = `
		m.helloWorld();
		import * as m from "../../i18n-generated/messages";
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match if m is defined but no reference to paraglide", () => {
		const sourceCode = `
		m.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match if m is defined but has a spell error", () => {
		const sourceCode = `
		import * as m from "../../i18n-generated/messages";
		xm.helloWorld();
		`
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match no matches", () => {
		const sourceCode = "const x = 42;"
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should match invalid syntax", () => {
		const sourceCode = "const x = 42; m.helloWorld("
		const result = parse(sourceCode)
		expect(result).toEqual([])
	})

	it("should return an empty array when parsing fails", () => {
		const sourceCode = undefined

		const result = parse(sourceCode as unknown as string)
		expect(result).toEqual([])
	})
})
