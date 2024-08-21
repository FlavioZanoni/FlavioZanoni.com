<script lang="ts">
  import Background from "../applications/Background.svelte"
  import XTerm from "../applications/XTerm.svelte"
  import FileExplorer from "../applications/FileExplorer.svelte"
  import ThisComputer from "../applications/ThisComputer.svelte"
  export let appName: string
  export let iNode: string
  export let uuid: string
  export let link: string
  export let isDirectory: boolean = false
  export let title: string

  const appComponents = {
    term: XTerm,
    background: Background,
    fileExplorer: FileExplorer,
    thisComputer: ThisComputer,
  }
</script>

{#if isDirectory}
  <FileExplorer name={appName} {iNode} />
{:else if link}
  <div class="w-full h-full">
    <iframe
      {title}
      class="w-full h-full"
      src={`${link}?isInOS=true`}
      frameborder="0"
    />
  </div>
{:else if appName === "recycleBin"}
  <FileExplorer name={"recycleBin"} iNode={"10"} />
{:else if appName in appComponents}
  <svelte:component this={appComponents[appName]} {uuid} />
{:else}
  <div>
    <h1>{appName}</h1>
    <p>Content goes here</p>
  </div>
{/if}
