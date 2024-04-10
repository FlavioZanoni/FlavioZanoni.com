<script lang="ts">
  import { desktopStore } from "@lib/store"
  import Button from "./Button.svelte"

  export let x: number = 0
  export let y: number = 0

  const handleBackground = () => {
    desktopStore.update((state) => {
      state.openApps.push({
        id: "contextMenu",
        uuid: crypto.randomUUID().toString(),
        title: "Background",
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
        isOpen: true,
        icon: "document.png", //TODO: create default icon
        type: "app",
        appName: "background",
      })

      return state
    })
  }
</script>

<div
  class="bg-slate-200 border-2 border-slate-900 absolute flex flex-col w-[250px] h-fit divide-y-2 divide-slate-900"
  style={`left: ${x}px; top: ${y}px;`}
>
  <Button on:click={handleBackground} id={"button1"}>Change background</Button>
  <Button id={"button2"}>My PC</Button>
</div>
