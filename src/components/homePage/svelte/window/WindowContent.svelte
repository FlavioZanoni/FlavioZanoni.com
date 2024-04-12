<script lang="ts">
  import Background from "../applications/Background.svelte"
  import XTerm from "../applications/XTerm.svelte"
  export let appName: string
  export let uuid: string
  export let link: string
  export let isApp: boolean = false
  export let title: string

  const appComponents = {
    term: XTerm,
    background: Background,
  }
</script>

{#if !isApp}
  <div>
    <h1>folder handler</h1>
  </div>
{:else if link}
  <div>
    <iframe {title} class="w-full h-full" src={link} frameborder="0" />
  </div>
{:else if appName in appComponents}
  <svelte:component this={appComponents[appName]} {uuid} />
{:else}
  <div>
    <h1>{appName}</h1>
    <p>Content goes here</p>
  </div>
{/if}
