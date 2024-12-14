<script>
    let { show, code } = $props();
</script>

{#if show}
<small>{code == 1 ? "Input should not contain spaces" :
    code == 2 ? "Input should only contain letters, hyphens, or apostrophes." : ""}
</small>
{/if}