<script>
	import { onMount, untrack } from "svelte";
    import { fade } from "svelte/transition";

    let { data } = $props();

    // Universal states
	import { dataState } from "../state.svelte.js"

    // shadcn imports
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    // Configuration variables
    import { categories } from "$lib/config.js"

    let filtersNum = $state(0)
    let startsWith = $state("")
    let contains = $state("")
    let endsIn = $state("")

    let hasError = $state(false)

    let titleArray = ["Mga", "Salitang"];
    let title = $state("");
    let subHeadingTitleArray = ["-Letter", "Tagalog", "Words", "That"]
    let subHeadingTitle = $state("");

    let subdividedResults = $state(new Map());
    let lengthsList = $state([]);

    let previousTotal = 0;

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
    })

    $effect(() => {
        if (dataState.hasResults && data.data.length != previousTotal) {
            previousTotal = data.data.length;

            console.log(`data.data.length ${data.data.length}`)
            console.log("hasResults")
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
                        subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight, "And", "Contain", containsHighlight]);
                    }
                } else {
                    titleArray = titleArray.concat(["Naglalaman", "Ng", containsHighlight, "At", "Nagtatapos", "Sa", endsInHighlight]);
                    subHeadingTitleArray = subHeadingTitleArray.concat(["Contain", containsHighlight, "And", "End", "In", endsInHighlight]);
                }
            } else if (filtersNum == 3) {
                titleArray = titleArray.concat(["Nagsisimula", "Sa", startsWithHighlight + ",", "Naglalaman", "Ng", containsHighlight + ',', "At", "Nagtatapos", "Sa", endsInHighlight]);
                subHeadingTitleArray = subHeadingTitleArray.concat(["Start", "With", startsWithHighlight + ",", "Contain", containsHighlight + ",", "And", "End", "In", endsInHighlight]);
            } 

            untrack(() => {
                title = titleArray.join(" ");
                subHeadingTitle = subHeadingTitleArray.join(" ");
            })


            // Subdivide based on length
            subdividedResults = data.data.reduce((acc, recordObject) => {
                const key = recordObject["length"];

                if (!acc.has(key)) {
                    acc.set(key, []); // Create a new group if it doesn't exist
                }

                acc.get(key).push(recordObject); // Add the object to the appropriate group
                return acc;
            }, new Map());

            lengthsList = new Set(subdividedResults.keys())

            console.log(subdividedResults[5])
        }
    })

</script>

{#if dataState.hasInitialData && !dataState.fetchingData}
    {#if dataState.hasResults}
        <div class="mt-12 py-4 pb-16 px-4 sm:mx-6 lg:mx-20">
            <h1 class="scroll-m-20 text-4xl font-extrabold mb-3 leading-9 tracking-tight lg:text-5xl" transition:fade={{ duration: 300 }}>
                {@html title}
            </h1>
            {#if data.data}
                <Badge variant="outline" class="mb-6">Found {data.data.length} words</Badge>
            {/if}

            <div class="space-y-4">
            {#each lengthsList as length}
                <section class="">
                    <h2 class="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">{@html length.toString() + subHeadingTitle}</h2>
                    <ul class="flex flex-wrap">
                        {#each subdividedResults.get(length) as wordRecord}
                        <li class="mr-4 cursor-pointer">
                            <Tooltip.Root>
                                <Tooltip.Trigger>{wordRecord.word}</Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>{wordRecord.category}</p>
                                    <p>{categories[wordRecord.category]}</p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                        </li>
                        
                        {/each}
                    </ul>
                </section>
            {/each}
            </div>
        </div>

    {:else}
        <p>no matching words</p>
    {/if}
{/if}
