<script>
    import '../../app.css';

    import { goto } from '$app/navigation';

    // shadcn imports
    import { Toaster } from "$lib/components/ui/sonner";
	import { toast } from "svelte-sonner";

    // svg imports
    import HomeIcon from "$lib/icons/home-icon.svelte"

    // Custom-made components
	import PopButton from "$lib/components/pop-button.svelte"

    let { children } = $props();
</script>

<div class="w-full h-screen relative">
    <PopButton className="fixed top-2 right-2 md:top-4 md:right-4 transition-all duration-300" onclick={() => goto("/search-by-parts")}><HomeIcon /></PopButton>

{@render children()}

</div>

<Toaster richColors position="top-center" />