<script>
	import '../app.css';

	import { fade, fly } from "svelte/transition";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	import SearchIcon from "$lib/icons/search-icon.svelte";
	import CloseIcon from "$lib/icons/close-icon.svelte"

	import PopButton from "$lib/components/pop-button.svelte"

	let { children } = $props();

	let mode = $state('by-parts');

	let showSearchBar = $state(false);
</script>

<div class="w-screen h-screen relative">
	<PopButton hide={showSearchBar} className="fixed top-2 right-2" onclick={() => showSearchBar = true}><SearchIcon /></PopButton>
	{#if showSearchBar}
	<div class="w-[425px] absolute top-2 left-1/2 -translate-x-1/2 transform transition-all duration-500 ease-in-out"
	in:fly={{ duration: 500, y: -500, opacity: 0 }}
	out:fly={{ duration: 500, y: -500, opacity: 0 }}>
	<Tabs.Root bind:value={mode} class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
		  <Tabs.Trigger value="by-parts">Search By Parts</Tabs.Trigger>
		  <Tabs.Trigger value="unscramble">Unscramble</Tabs.Trigger>
		  <Tabs.Trigger value="missing-letter">Find Missing Letters</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="by-parts">
		  <Card.Root>
			<Card.Header>
			  <Card.Title>Find Tagalog words that...</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
			  <div class="space-y-1">
				<Label for="start-with">Start With</Label>
				<Input id="start-with" value="" />
			  </div>
			  <div class="space-y-1">
				<Label for="contains">Contains</Label>
				<Input id="contains" value="" />
			  </div>
			  <div class="space-y-1">
				  <Label for="username">Ends In</Label>
				  <Input id="end-in" value="" />
			  </div>
			</Card.Content>
			<Card.Footer>
			  <Button>Find</Button>
			</Card.Footer>
		  </Card.Root>
		</Tabs.Content>
		<Tabs.Content value="unscramble">
		  <Card.Root>
			<Card.Header>
			  <Card.Title>Unscramble words<br/>Solve anagrams</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
			  <div class="space-y-1">
				<Label for="current">Current password</Label>
				<Input id="current" type="password" />
			  </div>
			</Card.Content>
			<Card.Footer>
			  <Button>Save password</Button>
			</Card.Footer>
		  </Card.Root>
		</Tabs.Content>
	  </Tabs.Root>
	  <PopButton hide={!showSearchBar} className="absolute -bottom-12 left-1/2 -translate-x-1/2" onclick={() => {showSearchBar = false}}><CloseIcon /></PopButton>
	</div>
	{/if}

	{@render children()}
  </div>
  