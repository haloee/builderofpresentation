<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  
</script>

{@render children()}
