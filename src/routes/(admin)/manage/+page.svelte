<script>
	// shadcn UI components
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';	
	import * as Select from "$lib/components/ui/select/index.js";
	import { toast } from "svelte-sonner";

	// Config variables
	import { categories as categoriesConfig } from "$lib/config.js"

	// Icons
	import CircleMinusIcon from "$lib/icons/circle-minus.svelte"
	import CheckIcon from "$lib/icons/check.svelte"

	// Svelte
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Universal states
	import { dataState } from "../../state.svelte.js"
    import { syncFavorites, syncFavoriteMode, resetHistoryStack } from "$lib/utils-reactive.svelte.js";

	let { data, form } = $props();

	// Sync favorites
	onMount(() => {
        syncFavorites();
        syncFavoriteMode();
    })

	// Reset History Stack
	resetHistoryStack();

	// Initial data
	const categories = [
		{ value: "PN", label: "Proper Noun" },
		{ value: "NV", label: "Noun" },
		{ value: "V", label: "Verb" },
		{ value: "C", label: "Conjugation" },
		{ value: "I", label: "Interjection" },
		{ value: "A", label: "Adjective" }
  	];

	// -- Initial data states --
	let newWordCategoryObject = $state(form?.missingBaseForm || (form?.category == 'C' && form?.baseFormContainsInvalid) ? {value: "C", label: "Conjugation"} : {value: "PN", label: "Proper Noun"});  // Select component bound value
	let newWordCategory = $state("PN");

	let updatedWordCategory = $state("PN");
	let initialUpdatedWordCategoryObject;  // Select component bound value
	// Determine its initial value based on previous `wordObj`
	if (form?.wordObj) {
		initialUpdatedWordCategoryObject = categories.find((v) => v.value == form.wordObj.category);
		updatedWordCategory = form.wordObj.category;
	} else {
		let categoryOptionObj = categories.find((v) => v.value == "C");
		let properNounOptionObj = categories.find((v) => v.value == "PN");
		initialUpdatedWordCategoryObject = form?.missingBaseForm || (form?.category == 'C' && form?.baseFormContainsInvalid) ? categoryOptionObj : properNounOptionObj;
	}
	let updatedWordCategoryObject = $state(initialUpdatedWordCategoryObject);	

	let wordToEdit = $state(form?.wordObj ? form.wordObj.word : '');

	// Derivations

	let previousWordToEdit = null;
	if (form?.wordObj) {
		previousWordToEdit = form.wordObj.word;
	}

	// Condition States

	let safeToSubmitEdits = $state(false);
	let sendStart = $state(false);
	
	// Effects

	// for `safeToSubmitEdits` derivation
	$effect(() => {
		if (form?.wordObj && wordToEdit == previousWordToEdit) {
			safeToSubmitEdits = true;
		} else {
			safeToSubmitEdits = false;
		}
	})

	$effect(() => {
		newWordCategory = newWordCategoryObject.value;
	})
	$effect(() => {
		console.log("change updatedWordCategory")
		updatedWordCategory = updatedWordCategoryObject.value;
	})
</script>

{#if sendStart}
	<div class="fixed w-full h-[130vh] -translate-y-12 z-50 bg-gray-50 opacity-50" transition:fade={{ duration: 300 }}></div>
{/if}

<div class="flex flex-col lg:flex-row flex-wrap mt-6 py-4 pb-16 px-4 sm:mx-6 lg:mx-20">
	<Card.Root class="w-full sm:max-w-96 mt-6 sm:ml-6 ">
		<form method="POST" action="?/add" class="flex flex-col w-full h-full">
			<Card.Header class="space-y-1">
				<Card.Title class="text-2xl">Add Word</Card.Title>
				<Card.Description>Enter a new Tagalog word</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="word">Word</Label>
					<Input id="word" name="w" type="text" placeholder="halo-halo" value={form?.word && !form?.success && form?.mode == 1 ? form.word : ''} />
					{#if form?.missingWord && form?.mode == 1}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Word cannot be empty.</small></span>
					{/if}
					{#if form?.wordContainsInvalid && form?.mode == 1}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Only letters, hyphens, and apostrophes are allowed.</small></span>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="c">Category</Label>
					<Select.Root type="single" bind:selected={newWordCategoryObject} name="c"  >
						<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a category" />
						</Select.Trigger>
						<Select.Content>
							{#each categories as category}
							<Select.Item value={category.value} label={category.label}
								>{category.label}</Select.Item
							>
							{/each}
						</Select.Content>
						<Select.Input id="c" name="c"  />
					</Select.Root>
				</div>
				{#if newWordCategory == "C"}
				<div class="grid gap-2">
					<Label for="bf">Verb Base Form</Label>
					<Input id="bf" name="bf" type="text" placeholder="ex. 'tumalon' for the 'tinalon' conjugation" value={form?.verbBaseForm && form?.mode == 1 ? form.verbBaseForm : ''} />
					{#if newWordCategory == "C" && form?.missingBaseForm && form?.mode == 1}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">The base form cannot be empty.</small></span>
					{/if}
					{#if newWordCategory == "C" && form?.baseFormContainsInvalid && form?.mode == 1}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Only letters, hyphens, and apostrophes are allowed.</small></span>
					{/if}
					
				</div>
				{/if}
			</Card.Content>
			<Card.Footer class="mt-auto flex flex-col space-y-2 items-start">
				{#if form?.success && form?.mode == 1}
					<span class="flex space-x-1 items-center text-start"><CheckIcon className="w-[17px] text-green-500"/><small class="text-green-500">'{form.word}' added successfully</small></span>
				{:else if form?.success == false && form?.mode == 1 }
					<span class="flex space-x-1 items-center text-start"><CircleMinusIcon className="w-[15px]"/><small class="text-red-500">An error occured.</small></span>
				{:else if form?.alreadyExists && form?.mode == 1}
					<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">The word '{form.word}' already exists in the database.</small></span>
				{/if}
				<Button type="submit" class="w-full" on:click={() => { toast.info("Adding word..."), sendStart = true } }  >Add</Button>
			</Card.Footer>
		</form>
	</Card.Root>


	<Card.Root class="w-full sm:max-w-96 mt-6 sm:ml-6">

			<Card.Header class="space-y-1">
				<Card.Title class="text-2xl">Edit Word</Card.Title>
				<Card.Description>Edit an existing word in the database</Card.Description>
			</Card.Header>

			<form method="POST" action="?/check" class="flex flex-col w-full h-content">
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="word-to-edit">Word to edit</Label>
					<Input id="word-to-edit" name="word-to-edit" type="text" placeholder="baguhn" />
					{#if form?.missingWord && form?.mode == 4}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Word cannot be empty.</small></span>
					{/if}
				</div>
			</Card.Content>
			<Card.Footer class="mt-auto flex flex-col space-y-2 items-start">
				{#if (!form?.missingWord) && (form?.exists && form?.mode == 4)}
					<span class="flex space-x-1 items-center text-start"><CheckIcon className="w-[17px] text-green-500"/><small class="text-green-500">The word '{form.wordObj.word}' exists</small></span>
				{:else if (!form?.missingWord) && (!form?.exists && form?.mode == 4)}
					<span class="flex space-x-1 items-center text-start"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">The word '{form.word}' does not exist</small></span>
				{/if}
				<Button variant="secondary" class="w-full" type="submit" on:click={() => { toast.info("Checking..."), sendStart = true } }>Check existence</Button>
			</Card.Footer>
			</form>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t" />
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card text-muted-foreground px-2"> update with new values </span>
				</div>
			</div>

			<form method="POST" action="?/edit" class="flex flex-col w-full h-content">
			<Card.Content class="grid gap-4">
				<Input id="pwo" name="pwo" type="hidden" value={JSON.stringify(form?.wordObj)} disabled={!safeToSubmitEdits} />
				<div class="grid gap-2">
					<Label for="new-word">New word</Label>
					<Input id="new-word" name="new-word" type="text" placeholder="baguhin" value={form?.wordObj && form?.exists ? form.wordObj.word : ''} disabled={!safeToSubmitEdits} />
					{#if form?.missingWord && form?.mode == 2}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Word cannot be empty.</small></span>
					{/if}
					{#if form?.wordContainsInvalid && form?.mode == 2}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Only letters, hyphens, and apostrophes are allowed.</small></span>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="c">Category</Label>
					<Select.Root type="single" bind:selected={updatedWordCategoryObject} name="category" disabled={!safeToSubmitEdits} >
						<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a category" />
						</Select.Trigger>
						<Select.Content>
							{#each categories as category}
							<Select.Item value={category.value} label={category.label} >{category.label}</Select.Item
							>
							{/each}
						</Select.Content>
						<Select.Input id="c" name="category"  />
					</Select.Root>
				</div>
				{#if updatedWordCategory == "C"}
				<div class="grid gap-2">
					<Label for="bf">Verb Base Form</Label>
					<Input id="bf" name="bf" type="text" placeholder="ex. 'tumalon' for the 'tinalon' conjugation" value={form?.wordObj ? form.wordObj.verb_base_form : ''} disabled={!safeToSubmitEdits} />
					{#if updatedWordCategory == "C" && form?.missingBaseForm && form?.mode == 2}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500"> The base form cannot be empty.</small></span>
					{/if}
					{#if updatedWordCategory == "C" && form?.baseFormContainsInvalid && form?.mode == 2}
						<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">Only letters, hyphens, and apostrophes are allowed.</small></span>
					{/if}
				</div>
				{/if}
			</Card.Content>
			<Card.Footer class="mt-auto flex flex-col space-y-2 items-start">
				{#if form?.success && form?.mode == 2}
					<span class="flex space-x-1 items-center text-start"><CheckIcon className="w-[17px] text-green-500"/><small class="text-green-500">Word edited successfully</small></span>
				{:else if form?.alreadyExists && form?.mode == 2}
					<span class="flex space-x-1 items-center"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">The word '{form.newWord}' already exists in the database.</small></span>
				{/if}
				<Button class="w-full" type="submit" on:click={() => { toast.info("Editing record..."), sendStart = true }} disabled={!safeToSubmitEdits}>Update</Button>
			</Card.Footer>
			</form>

	</Card.Root>


	<Card.Root class="w-full sm:max-w-96 mt-6 sm:ml-6">
		<form method="POST" action="?/delete" class="flex flex-col w-full h-full">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl">Delete Word</Card.Title>
			<Card.Description>Remove a word from the database</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="grid gap-2">
				<Input id="word" type="text" name="w" placeholder="mabubura" />
			</div>
		</Card.Content>
		<Card.Footer class="mt-auto flex flex-col space-y-2 items-start">
			{#if form?.success && form?.mode == 3}
				<span class="flex space-x-1 items-center text-start"><CheckIcon className="w-[17px] text-green-500"/><small class="text-green-500">'{form.word}' removed successfully</small></span>
			{:else if (form?.success && form.success == false) && form?.mode == 3}
				<span class="flex space-x-1 items-center text-start"><CircleMinusIcon className="w-[15px]"/><small class="text-red-500">An error occured.</small></span>
			{:else if form?.notExists && form?.mode == 3}
				<span class="flex space-x-1 items-center text-start"><CircleMinusIcon className="w-[15px]"/><small class="text-neutral-500">'{form.word}' does not exist in the database.</small></span>
			{/if}
			<Button type="submit" on:click={() => { toast.info("Removing word..."), sendStart = true } } class="w-full">Delete</Button>
		</Card.Footer>
		</form>
	</Card.Root>
</div>
