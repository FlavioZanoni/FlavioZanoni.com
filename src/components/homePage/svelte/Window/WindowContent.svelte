<script lang="ts">
  import Background from "../applications/Background.svelte"
  import XTerm from "../applications/XTerm.svelte"
  export let appName: string
  export let uuid: string
</script>

{#if appName === "term"}
  <XTerm {uuid} />
{:else if appName === "background"}
  <Background />
{:else}
  <div>
    <h1>{appName}</h1>
    <p>Content goes here</p>
  </div>
{/if}
