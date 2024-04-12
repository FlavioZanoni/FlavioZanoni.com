<script lang="ts">
  import { osStore } from "@lib/store"
  import Window from "./Window.svelte"
</script>

{#each $osStore.enviroment.openApps as { ...app } (app.uuid)}
  {#if !app.isMinimized}
    <Window {...app} />
  {/if}
{/each}
