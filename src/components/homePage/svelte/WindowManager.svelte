<script lang="ts">
  import { desktopStore } from "@lib/store"
  import type { OpenApp } from "@lib/store/types"
  import Window from "./Window.svelte"

  let store: OpenApp[]
  $: {
    console.log($desktopStore.openApps)
    store = $desktopStore.openApps as OpenApp[]

    store.forEach((app) => {
      if (app.isMinimized) {
        desktopStore.update((state) => {
          if (state.taskbar.openApps.find((item) => item.uuid === app.uuid)) {
            return state
          }

          const thisApp = state.openApps.find((item) => item.uuid === app.uuid)
          state.taskbar.openApps.push({
            ...thisApp,
          })
          return state
        })
      }
    })
  }
</script>

{#each store as app (app.uuid)}
  {#if app.isOpen && !app.isMinimized}
    <Window {...app} />
  {/if}
{/each}
