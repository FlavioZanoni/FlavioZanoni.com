<script lang="ts">
  import { osStore } from "@lib/store"
  import Button from "./Button.svelte"

  export let x: number = 0
  export let y: number = 0

  const handleBackground = () => {
    osStore.update((state) => {
      state.enviroment.openApps.push({
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

<div
  class="bg-slate-200 border-2 border-slate-900 absolute flex flex-col w-[250px] h-fit divide-y-2 divide-slate-900"
  style={`left: ${x}px; top: ${y}px;`}
>
  <Button on:click={handleBackground} id={"button1"}>Change background</Button>
  <Button on:click={toggleCRT} id={"button2"}>Toggle CRT effect</Button>
</div>
