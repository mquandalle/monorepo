<script>
	import { base } from "$app/paths"
	import { page } from "$app/stores"
	import ParaglideJs from "$paraglide/ParaglideJS.svelte"
    import * as m from "$paraglide/messages.js"
</script>

<ParaglideJs languageTag="en">
    <h1>{$page.error?.message}</h1>
    <a href="{base}/">{m.home()}</a>
</ParaglideJs>