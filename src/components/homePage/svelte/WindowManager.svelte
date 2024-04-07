<script lang="ts">
  import { desktopStore } from "@lib/store"
  import Window from "./Window.svelte"
</script>

{#each $desktopStore.openApps as app (app.uuid)}
  {#if app.isOpen && !app.isMinimized}
    <Window {...app} />
  {/if}
{/each}
