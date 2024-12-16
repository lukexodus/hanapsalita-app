<script>
	import '../../app.css';

	// Universal states
	import { dataState } from "../state.svelte.js";

	// shadcn imports

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import { Description } from '@/ui/alert';
	import { Toaster } from "$lib/components/ui/sonner";
	import { toast } from "svelte-sonner";

	// svg imports

	import SearchIcon from "$lib/icons/search-icon.svelte";
	import CloseIcon from "$lib/icons/close-icon.svelte"

	// Custom-made components

	import PopButton from "$lib/components/pop-button.svelte"
	import InputErrorMessage from '@/input-error-message.svelte';

	// Svelte imports

	import { untrack } from 'svelte';
	import { fade, fly } from "svelte/transition";
	import { goto } from '$app/navigation';

	// Props

	let { children } = $props();

	// UI States

	let mode = $state('search-by-parts');
	let showSearchBar = $state(false);

	// Input bound values

	let startsWith = $state("");
	let contains = $state("");
	let endsIn = $state("");

	let scrambledLetters = $state("");

	let wordWithMissingLetters = $state("");

	// Bind elements

	let formElement = $state(null);

	$effect(() => {
		if (formElement) {
			function submitCallback (event) {
				if (showSearchBar && event.key === "Enter") {
					console.log("form enter keydown")
					event.preventDefault();
					if (mode == 'search-by-parts') {
						submitSearchByParts();
					} else if (mode == 'unscramble') {
						submitUnscramble();
					} else if (mode == 'find-missing-letters') {
						submitWordWithMissingLetters();
					}
				}
			}

			formElement.addEventListener("keydown", submitCallback);
		}
	})


	// Go to the relevant page based on the mode/tool
	let nonPrimaryToolVisited = $state(false);
	$effect(() => {
		if (mode == 'unscramble' || mode == 'find-missing-letter') {
			nonPrimaryToolVisited = true;
		}
		console.log(`mode change ${mode}`)
		if (nonPrimaryToolVisited) {
			goto(`/${mode}`)
		}
	})

	// Validate search by parts input

	function validateInput(letters) {  // Validation function
		let valid = true;
		let errorCode = 0;

		// 1 - Contains spaces
		// 2 - Contains invalid chars
		
		// Regular expression to match characters other than alphas, apostrophes, and hyphens
		const invalidCharPattern = /[^a-zA-Z'-]/;

		if (letters.includes(" ")) {
			valid = false
			errorCode = 1
		}
		else if (invalidCharPattern.test(letters)) {
			valid = false
			errorCode = 2
		}

		return {
			valid, errorCode
		}
	}

	let startsWithValid = $state(true);
	let startsWithErrorCode = $state(0)
	let containsValid = $state(true);
	let containsErrorCode = $state(0)
	let endsInValid = $state(true);
	let endsInErrorCode = $state(0)

	let scrambledValid = $state(true);
	let scrambledErrorCode = $state(0);

	let wordWithMissingValid = $state(true);
	let wordWithMissingErrorCode = $state(0);

	// Submit functinos

	function submitSearchByParts() {
		// Validate inputs
		if (startsWith) {
			const { valid, errorCode } = validateInput(startsWith);
			startsWithValid = valid;
			startsWithErrorCode = errorCode;

			if (!startsWithValid) {
				return
			}
		}
		if (contains) {
			const { valid, errorCode } = validateInput(contains);
			containsValid = valid;
			containsErrorCode = errorCode;

			if (!containsValid) {
				return
			}
		}
		if (endsIn) {
			const { valid, errorCode } = validateInput(endsIn);
			endsInValid = valid;
			endsInErrorCode = errorCode;

			if (!endsInValid) {
				return
			}
		}

		if (!startsWith && !contains && !endsIn) {
			toast.warning("All inputs are empty.")
		}

		dataState.fetchingData = true;

		// Submit data

		const paramsObject = {};
		if (startsWith) {
			paramsObject.startsWith = startsWith;
		}
		if (contains) {
			paramsObject.contains = contains;
		}
		if (endsIn) {
			paramsObject.endsIn = endsIn;
		}
		const paramsPart = `${new URLSearchParams(paramsObject).toString()}`;

		console.log('/search-by-parts?' + paramsPart)

		showSearchBar = false;
		startsWith = "";
		contains = "";
		endsIn = "";
		goto('/search-by-parts?' + paramsPart);
	}

	function submitUnscramble() {
		if (scrambledLetters) {
			const { valid, errorCode } = validateInput(scrambledLetters);
			scrambledValid = valid;
			scrambledErrorCode = errorCode;

			if (!scrambledValid) {
				return;
			}
		} else {
			toast.warning("Input is empty.");
			return;
		}

		dataState.fetchingData = true;

		// Submit Data

		const paramsObject = { w: scrambledLetters };
		const paramsPart = `${new URLSearchParams(paramsObject).toString()}`;

		showSearchBar = false;
		goto('/unscramble?' + paramsPart);
	}

	function submitWordWithMissingLetters() {
		if (wordWithMissingLetters) {
			const { valid, errorCode } = validateInput(wordWithMissingLetters);
			wordWithMissingValid = valid;
			wordsWithMissingErrorCode = errorCode;

			if (!wordWithMissingValid) {
				return;
			}
		} else {
			toast.warning("Input is empty.");
			return;
		}

		dataState.fetchingData = true;

		// Submit Data

		const paramsObject = { w: wordWithMissingLetters };
		const paramsPart = `${new URLSearchParams(paramsObject).toString()}`;

		showSearchBar = false;
		goto('/find-missing-letters?' + paramsPart);
	}
</script>

<div class="w-full h-screen relative">
	<PopButton hide={showSearchBar} className="fixed top-2 right-2 md:top-4 md:right-4 transition-all duration-300" onclick={() => showSearchBar = true}><SearchIcon /></PopButton>
{#if showSearchBar}
	<div class="bg-neutral-100 opacity-60 w-full fixed z-10 h-[130vh] -translate-y-12" transition:fade={{ duration: 300 }}></div>
	<div 	
	class="w-full sm:w-[425px] fixed top-2 left-1/2 -translate-x-1/2 transform transition-all duration-500 ease-in-out z-20"
	in:fly={{ duration: 500, y: -500, opacity: 0 }}
	out:fly={{ duration: 500, y: -500, opacity: 0 }} bind:this={formElement}>
	<Tabs.Root bind:value={mode} class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
		  <Tabs.Trigger value="search-by-parts">Search By Parts</Tabs.Trigger>
		  <!-- <Tabs.Trigger value="unscramble">Unscramble</Tabs.Trigger>
		  <Tabs.Trigger value="find-missing-letters">Find Missing Letters</Tabs.Trigger> -->
		</Tabs.List>
		<Tabs.Content value="search-by-parts">
		  <Card.Root>
			<Card.Header>
			  <Card.Title>Find Tagalog words that...</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
			  <div class="space-y-1">
				<Label for="start-with">Starts With</Label>
				<Input id="start-with" name="start-with" bind:value={startsWith} />
				<InputErrorMessage show={!startsWithValid} code={startsWithErrorCode} />
			  </div>
			  <div class="space-y-1">
				<Label for="contains">Contains</Label>
				<Input id="contains" name="contains" bind:value={contains} />
				<InputErrorMessage show={!containsValid} code={containsErrorCode} />
			  </div>
			  <div class="space-y-1">
				  <Label for="username">Ends In</Label>
				  <Input id="end-in" name="end-in" bind:value={endsIn} />
				  <InputErrorMessage show={!endsInValid} code={endsInErrorCode} />
			  </div>
			</Card.Content>
			<Card.Footer>
			  <Button onclick={submitSearchByParts}>Find</Button>
			</Card.Footer>
		  </Card.Root>
		</Tabs.Content>
		<!-- <Tabs.Content value="unscramble">
		  <Card.Root>
			<Card.Header>
			  <Card.Title>Unscramble words.</Card.Title>
			  <Card.Description>Solve anagrams.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
			  <div class="space-y-1">
				<Input id="scrambled-word" name="input" placeholder="Enter letters" bind:value={scrambledLetters} />
				<InputErrorMessage show={!scrambledValid} code={scrambledErrorCode} />
			  </div>
			</Card.Content>
			<Card.Footer>
			  <Button onclick={submitUnscramble}>Solve</Button>
			</Card.Footer>
		  </Card.Root>
		</Tabs.Content>
		<Tabs.Content value="find-missing-letters">
			<Card.Root>
			  <Card.Header>
				<Card.Title>Find words with missing letters.</Card.Title>
				<Card.Description>Solve crossword puzzles.</Card.Description>
			  </Card.Header>
			  <Card.Content class="space-y-2">
				<div class="space-y-1">
				  <Input id="word-with-missing-letters" name="input" placeholder="Enter letters" bind:value={wordWithMissingLetters} />
				  <p class="opacity-50 pl-2 mt-4 flex flex-col"><small>Use ~ for an unknown single letter.</small><small>Use * for zero or more unknown letters.</small></p>
				  <InputErrorMessage show={!wordWithMissingValid} code={wordWithMissingErrorCode} />
				</div>
			  </Card.Content>
			  <Card.Footer>
				<Button onclick={submitWordWithMissingLetters}>Solve</Button>
			  </Card.Footer>
			</Card.Root>
		  </Tabs.Content> -->
	  </Tabs.Root>
	  <PopButton hide={!showSearchBar} className="absolute -bottom-12 left-1/2 -translate-x-1/2" onclick={() => {showSearchBar = false}}><CloseIcon /></PopButton>
	</div>
{/if}

{#if (!dataState.hasInitialData || dataState.fetchingData) && !showSearchBar}
	<div class="fixed mx-auto my-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full flex items-center justify-center flex-col z-10"
	transition:fade={{duration: 300}}>
		{#if dataState.fetchingData}

		<div class="animate-pulse fixed -translate-y-16 flex items-center justify-center w-full h-screen rounded-lg bg-gray-50 dark:bg-gray-800">
			<div role="status">
				<svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-neutral-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
				<span class="sr-only">Loading...</span>
			</div>
		</div>


		{/if}
		<div class="text-[44px] leading-9 pb-2 font-semibold tracking-tight transition-colors">
			HanapSalita
		</div>
		<div class="text-base text-neutral-400 transition-colors">
			Find Tagalog words in a breeze.
		</div>
	</div>
{/if}

{@render children()}

</div>

<Toaster richColors />
  