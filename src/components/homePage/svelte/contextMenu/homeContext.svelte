<script lang="ts">
  import { osStore } from "@lib/store"
  import Button from "../Button.svelte"

  const handleBackground = () => {
    osStore.update((state) => {
      state.enviroment.openApps.push({
        name: "background",
        iNode: "4",
        uuid: crypto.randomUUID().toString(),
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
      })

      return state
    })
  }

  const toggleCRT = () => {
    osStore.update((state) => {
      state.enviroment.config.crt = !state.enviroment.config.crt
      return state
    })
  }
</script>

<Button on:click={handleBackground} id={"button1"}>Change background</Button>
<Button on:click={toggleCRT} id={"button2"}>Toggle CRT effect</Button>
