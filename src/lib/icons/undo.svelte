<script>
  let { className, disabled, ...props } = $props();
</script>

<svg class={`w-6 h-6dark:text-white ${className} ${disabled ? 'text-gray-100' : 'text-gray-800'}`} {disabled} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"/>
  </svg>
  