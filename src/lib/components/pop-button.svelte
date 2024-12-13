<script>
    import { fade } from "svelte/transition";

    let { className, children, hide = false, ...props } = $props();
</script>

{#if !hide}
    <button {...props} class={`w-min h-min p-2 ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-input bg-background hover:bg-accent hover:text-accent-foreground border ${className} ${hide ? 'pointer-events-none' : 'pointer-events-auto'}`}
    transition:fade>
        {@render children?.()}
    </button>
{/if}