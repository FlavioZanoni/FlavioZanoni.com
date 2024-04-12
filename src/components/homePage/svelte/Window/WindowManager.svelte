<script lang="ts">
  import { desktopStore } from "@lib/store"
  import Window from "./Window.svelte"
</script>

{#each $desktopStore.openApps as { isOpen, ...app } (app.uuid)}
  {#if isOpen && !app.isMinimized}
    <Window {...app} />
  {/if}
{/each}
