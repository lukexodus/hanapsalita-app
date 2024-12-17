<script>
    import { onMount } from "svelte"

    // shadcn imports
    import { Badge } from "$lib/components/ui/badge/index.js";

    // Universal state
    import { dataState } from '../../state.svelte';
    import { syncFavorites, syncFavoriteMode, resetHistoryStack } from '$lib/utils-reactive.svelte';

    let favorites = $state(null);

    // Sync favorites
    onMount(() => {
        syncFavorites();
        syncFavoriteMode();

        favorites = JSON.parse(localStorage.getItem("favorites"));
    })

    // Reset History Stack
    resetHistoryStack();
</script>

<div>
    <div class="mt-14 py-4 pb-16 px-4 sm:mx-6 lg:mx-20 xl:mx-60 2xl:mx-96">
        <h1 class="scroll-m-20 text-4xl font-extrabold mb-3 leading-9 tracking-tight lg:text-5xl">
            My Favorites
        </h1>

        <Badge variant="outline" class="mb-6">You have {favorites?.length ?? 0} {favorites?.length ?? 0 > 1 ? 'favorites' : 'favorite'}</Badge>

        <ul class="flex flex-wrap">
        {#if favorites && favorites.length > 0}
            {#each favorites as favorite}
                <li class="mr-4 mt-1">{favorite}</li>
            {/each}
        {/if}
        </ul>
    </div>
</div>