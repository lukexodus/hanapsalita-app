<script>
	import { onMount, untrack } from "svelte";
    import { fade } from "svelte/transition";

    let { data } = $props();
	import { dataState } from "../state.svelte.js"  // Universal states

    let filtersNum = $state(0)
    let startsWith = $state("")
    let contains = $state("")
    let endsIn = $state("")

    let hasError = $state(false)

    let titleArray = ["Mga", "Salitang"];
    let title = $state("");
    let subHeadingTitleArray = ["-Letter", "Tagalog", "Words", "That"]
    let subHeadingTitle = $state("");

    let keywordStyle = "border-b";

    onMount(() => {
        console.log("page mount")
        dataState.fetchingData = false;
    });

    $effect(() => {
        dataState.fetchingData = false;
        if (!dataState.hasInitialData) {
            if (data.state && data.state > 0) {
                dataState.hasInitialData = true;
            } else {
                dataState.hasInitialData = false;
            }
        }
        
        dataState.hasResults = data.data && data.data.length > 0 ? true : false;
        
        if (dataState.hasResults) {
            // Update state from server-data
            let { filtersNum: filtersNumNew, startsWith: startsWithNew, contains: containsNew, endsIn: endsInNew } = data;
            filtersNum = filtersNumNew;
            startsWith = startsWithNew;
            contains = containsNew;
            endsIn = endsInNew;

            // Reset initial state of title
            titleArray = ["Mga", "Salitang"];
            subHeadingTitleArray = ["-Letter", "Tagalog", "Words", "That"];

            // Form the highlighted keyword as html
            let startsWithHighlight;
            let containsHighlight;
            let endsInHighlight;
            if (startsWith) {
                startsWithHighlight = `<span class="${keywordStyle}">${startsWith.toUpperCase()}</span>`
            }
            if (contains) {
                containsHighlight = `<span class="${keywordStyle}">${contains.toUpperCase()}</span>`
            }
            if (endsIn) {
                endsInHighlight = `<span class="${keywordStyle}">${endsIn.toUpperCase()}</span>`
            }

            // Form the title based on the filters
            if (filtersNum == 1) {
                if (startsWith) {
                    titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight]);
                } else if (contains) {
                    titleArray = titleArray.concat(["Naglalaman", "Ng", containsHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Contains", containsHighlight]);
                } else if (endsIn) {
                    titleArray = titleArray.concat(["Nagtatapos", "Sa", endsInHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Ends", "In", endsInHighlight]);
                }
            } else if (filtersNum == 2) {

            } else if (filtersNum == 3) {
                titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight + ",", "Naglalaman", "Ng", containsHighlight + ',', "At", "Nagtatapos", "Sa", endsInHighlight]);
                subHeadingTitleArray = subHeadingTitleArray.concat(["Starts", "With", startsWithHighlight + ",", "Contains", containsHighlight + ",", "And", "Ends", "In", endsInHighlight]);
            } 

            untrack(() => {
                title = titleArray.join(" ");
                subHeadingTitle = subHeadingTitleArray.join(" ");
            })
        }
    })

</script>

{#if dataState.hasInitialData && !dataState.fetchingData}
    {#if dataState.hasResults}

        <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" transition:fade={{ duration: 300 }}>
            {@html title}
        </h1>

        {#each data.data as row}
            <p transition:fade={{ duration: 300 }}>{row.word}</p>
        {/each}

    {:else}
        <p>no matching words</p>
    {/if}
{/if}
