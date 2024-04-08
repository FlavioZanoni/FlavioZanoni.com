<script lang="ts">
  import XTerm from "./applications/XTerm.svelte"
  export let appName: string
  export let uuid: string
</script>

{#if appName === "term"}
  <XTerm {uuid} />
{:else}
  <div>
    <h1>{appName}</h1>
    <p>Content goes here</p>
  </div>
{/if}
