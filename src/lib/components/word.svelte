<script>
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { categories } from "$lib/config.js"
    
    import { dataState } from "../../routes/state.svelte";

    let { wordRecord } = $props();

    let isFavorite = $state(dataState.favorites && dataState.favorites.has(wordRecord.word));

    function toggleIsFavorite() {
        if (dataState.favoriteMode) {
            isFavorite = !isFavorite;
            if (dataState.favorites) {
                if (isFavorite) {
                    dataState.favorites.add(wordRecord.word);
                } else {
                    dataState.favorites.delete(wordRecord.word);
                }
            } else {
                dataState.favorites = new Set([wordRecord.word]);
            }
        }
    }
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        {#if isFavorite && dataState.favoriteMode}
            <span class="focus:ring-ring inline-flex select-none items-center rounded-full border px-2.5 py-0.5 text-[0.9rem] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/80 border-transparent"
            on:click={() => toggleIsFavorite()}>
                {wordRecord.word}
            </span>
        {:else}
            <span on:click={() => toggleIsFavorite()} class="py-1">
                {wordRecord.word}
            </span>
        {/if}
    </Tooltip.Trigger>
    <Tooltip.Content>
        <p>{categories[wordRecord.category]}</p>
        {#if wordRecord.category == "C"}
        <small>Base form: {wordRecord.verb_base_form}</small>
        {/if}
    </Tooltip.Content>
</Tooltip.Root>