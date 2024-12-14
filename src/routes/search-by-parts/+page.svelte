<script>
    let { data } = $props();
    if (data.data) {
        console.log(`data.data ${data.data}`)
    }
</script>

<p>search</p>    
{#await data}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then data}
	<!-- promise was fulfilled or not a Promise -->
	<p>The value is {data.state}</p>
    {#each data.data as row}
        <p>{row.word}</p>
    {/each}
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
<p>hello</p>