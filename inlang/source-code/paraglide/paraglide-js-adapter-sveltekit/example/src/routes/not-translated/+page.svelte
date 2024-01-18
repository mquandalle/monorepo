<script>
	import { base } from "$app/paths"
	import * as m from "$paraglide/messages.js"
	import ParaglideJs from "$paraglide/ParaglideJS.svelte"
</script>

<ParaglideJs languageTag="en">
	<h1>Not Translated</h1>
	<a href="{base}/">{m.home()}</a>
</ParaglideJs>