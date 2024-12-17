<script>
	import { onMount, untrack } from "svelte";
    import { fade } from "svelte/transition";

    let { data } = $props();

    // Universal states
	import { dataState } from "../../state.svelte.js"
    import { syncFavorites, syncFavoriteMode, resetHistoryStack } from "$lib/utils-reactive.svelte.js";

    // shadcn imports
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    // own components imports
    import Word from "$lib/components/word.svelte"

    // Configuration variables
    import { categories } from "$lib/config.js"

    // Data structures
    import { LinkedList, Stack } from "$lib/data-structures.svelte.js"
 
    // Input states
    let filtersNum = $state(0)
    let startsWith = $state("")
    let contains = $state("")
    let endsIn = $state("")

    // Title and subheading formation values
    let titleArray = ["Mga", "Salitang"];
    let title = $state("");
    let subHeadingTitleArray = ["-Letter", "Tagalog", "Words", "That"]
    let subHeadingTitle = $state("");

    // Content
    let subdividedResults = $state(new Map());  // key: int(length) | value: string(word)[]
    let lengthsList = $state([]);  // To be iterated upon

    // History stack reinitialize (not working)
    resetHistoryStack();
    // Track history stack
    $effect(() => {
        console.log(`dataState.historyStack change ${dataState.historyStack.size()}`)
        if (dataState.historyStack.size() > 0) {
            dataState.undoAvailable = true;
        } else {
            dataState.undoAvailable = false;
        }
    });

    $effect(() => {
        console.log(`dataState.undidHistoryStack change ${dataState.undidHistoryStack.size()}`)
        if (dataState.undidHistoryStack.size() > 0) {
            dataState.redoAvailable = true;
        } else {
            dataState.redoAvailable = false;
        }
    });

    // Saving current data for future reference
    let previousTotal = 0;  // This variable is to fix (in a makeshift way) the bug of the `process data effect` running twice

    // Variables for deduplication
    let keywordStyle = "border-b";

    // When the page mounts, load function has already finished
    onMount(() => {
        console.log("page mount")
        dataState.fetchingData = false;
    });

    // Sync favorites
    onMount(() => {
        syncFavorites();
        syncFavoriteMode();
    })

    // Reset History Stack
    resetHistoryStack();

    // -- Effects --

    // Update data availability and fetching states.
    // UI updates depend on these states.
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
    })

    // Process data effect
    $effect(() => {
        if (dataState.hasResults && data.data.length != previousTotal) {
            // Save current data length
            previousTotal = data.data.length;

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
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Contain", containsHighlight]);
                } else if (endsIn) {
                    titleArray = titleArray.concat(["Nagtatapos", "Sa", endsInHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["End", "In", endsInHighlight]);
                }
            } else if (filtersNum == 2) {
                if (startsWith) {
                    if (contains) {
                        titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight, "At", "Naglalaman", "Ng", containsHighlight]);
                        subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight, "And", "Contain", containsHighlight]);
                    } else if (endsIn) {
                        titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight, "At", "Nagtatapos", "Sa", endsInHighlight]);
                        subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight, "And", "End", "In", endsInHighlight]);
                    }
                } else {
                    titleArray = titleArray.concat(["Naglalaman", "Ng", containsHighlight, "At", "Nagtatapos", "Sa", endsInHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Contain", containsHighlight, "And", "End", "In", endsInHighlight]);
                }
            } else if (filtersNum == 3) {
                titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight + ",", "Naglalaman", "Ng", containsHighlight + ',', "At", "Nagtatapos", "Sa", endsInHighlight]);
                subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight + ",", "Contain", containsHighlight + ",", "And", "End", "In", endsInHighlight]);
            } 

            // Prevent reruns of effect caused by tracking of
            // unrelated states.
            untrack(() => {
                title = titleArray.join(" ");
                subHeadingTitle = subHeadingTitleArray.join(" ");
            })


            // Subdivide the list of words based on length
            subdividedResults = data.data.reduce((acc, recordObject) => {
                const key = recordObject["length"];

                if (!acc.has(key)) {
                    acc.set(key, []); // Create a new group if it doesn't exist
                }

                acc.get(key).push(recordObject); // Add the object to the appropriate group
                return acc;
            }, new Map());

            // Make the list of lengths, to be iterated upon
            lengthsList = new Set(subdividedResults.keys())
        }
    })

</script>

{#if dataState.hasInitialData && !dataState.fetchingData}
    <!-- If there are results -->
    {#if dataState.hasResults}
        <div class="mt-14 py-4 pb-16 px-4 sm:mx-6 lg:mx-20 xl:mx-60 2xl:mx-96">
            <h1 class="scroll-m-20 text-4xl font-extrabold mb-3 leading-9 tracking-tight lg:text-5xl" transition:fade={{ duration: 300 }}>
                {@html title}
            </h1>
            {#if data.data}
                <Badge variant="outline" class="mb-6">Found {data.data.length} {data.data.length > 1 ? 'words' : 'word'}</Badge>
            {/if}

            <div class="space-y-6">
            <!-- Subdivision by length -->
            {#each lengthsList as length}
                <section class="">
                    <h2 class="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">{@html length.toString() + subHeadingTitle}</h2>
                    <ul class="flex flex-wrap">
                        {#each subdividedResults.get(length) as wordRecord}
                        <li class="mr-4 mt-1 cursor-pointer">
                            <Word {wordRecord} historyStack={dataState.historyStack} />
                        </li>
                        
                        {/each}
                    </ul>
                </section>
            {/each}
            </div>
        </div>

    <!-- If there are no matching words -->
    {:else}
        <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full">
            <h2 class="scroll-m-20 text-4xl font-semibold tracking-tight transition-colors first:mt-0">No matching words</h2>
            <small class="text-[0.91rem]">Please try another keyword or try another filter.</small>
        </div> 
    {/if}
{/if}
