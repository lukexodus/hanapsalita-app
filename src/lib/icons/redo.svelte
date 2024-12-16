<script>
  let { className, ...props } = $props();
</script>

<svg class={`w-6 h-6 text-gray-800 dark:text-white ${className}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4"/>
  </svg>
  