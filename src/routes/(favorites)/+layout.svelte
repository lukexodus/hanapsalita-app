<script>
    import '../../app.css';

    import { onMount } from "svelte"
    import { goto } from '$app/navigation';

    // svg imports
    import HomeIcon from "$lib/icons/home-icon.svelte"

    // Custom-made components
	import PopButton from "$lib/components/pop-button.svelte"

    // Universal state
    import { dataState } from '../state.svelte';
    import { syncFavorites, syncFavoriteMode, resetHistoryStack } from '$lib/utils-reactive.svelte';

    let { children } = $props();

    // Sync favorites
    onMount(() => {
        syncFavorites();
        syncFavoriteMode();
    })

    // Reset History Stack
	resetHistoryStack();
</script>

<div class="w-full h-screen relative">
    <PopButton className="fixed top-2 right-2 md:top-4 md:right-4 transition-all duration-300" onclick={() => goto("/search-by-parts")}><HomeIcon /></PopButton>
        
    {@render children()}
</div>
