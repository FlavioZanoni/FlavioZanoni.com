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
          const thisApp = state.openApps.find((item) => item.id === app.id)

          const newState = { ...state }

          newState.taskbar.items.push({
            ...thisApp,
          })

          return newState
        })
      }
    })
  }
</script>

{#each store as app (app.id)}
  {#if app.isOpen && !app.isMinimized}
    <Window {...app} />
  {/if}
{/each}
