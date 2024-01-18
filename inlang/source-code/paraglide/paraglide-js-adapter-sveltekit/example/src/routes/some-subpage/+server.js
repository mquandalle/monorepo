import { base } from "$app/paths"
import { redirect } from "@sveltejs/kit"
import { resolveRoute } from "$paraglide/routing.js"

export const prerender = true

export function GET() {
	redirect(303, resolveRoute(base + "/about", "fr"))
}
