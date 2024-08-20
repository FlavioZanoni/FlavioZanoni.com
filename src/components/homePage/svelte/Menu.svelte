<script lang="ts">
  import pkgjson from "../../../../package.json"
  import { osStore } from "@lib/store"
  import { openApp } from "@lib/utils/enviromentUtils"
  import { getItemByINode } from "@lib/utils/fileSystemUtils"
  import { onMount } from "svelte"
  import Button from "./Button.svelte"

  export let id: string

  let left = "0px"
  let bottom = "0px"

  const version = pkgjson.version

  onMount(() => {
    const menuBtn = document.getElementById("menuBtn")
    const menuBtnRect = menuBtn.getBoundingClientRect()
    left = `${menuBtnRect.left}px`
    bottom = `${window.innerHeight - menuBtnRect.bottom + menuBtnRect.height + 1}px` // 1 is for the border
  })
</script>

<section
  {id}
  style="left: {left}; bottom: {bottom};"
  class="w-[400px] h-[600px] bg-slate-400 absolute p-2 pl-0 border border-slate-900 z-10"
>
  <div class="flex h-full w-full gap-2">
    <div class="bg-slate-300 w-12 h-full flex items-end">
      <h2
        class="vertical-text transform rotate-180 mb-6 text-gray-800 text-3xl text-center"
      >
        FZ-OS
      </h2>
    </div>
    <div class="w-full mb-4">
      <div
        class="flex h-full gap-1 flex-col w-full items-start overflow-y-auto"
      >
        {#each $osStore.enviroment.menu.items as item, index (item.iNode)}
          {@const currentItem = getItemByINode(item.iNode)}
          <Button
            variant="secondary"
            id={index.toString()}
            customCss="w-full"
            on:click={() => {
              openApp(item.iNode)
            }}
          >
            <div class="flex w-full justify-start items-center gap-2">
              <img
                src={`/icons/${currentItem?.icon ?? "/directory.png"}`}
                alt={item.name}
                class="w-5 h-5"
              />
              <span>{item.name}</span>
            </div>
          </Button>
        {/each}
      </div>
      <div class="w-full flex justify-end">
        <span class="text-[#a1a5b5] mr-3">Version: {version}</span>
      </div>
    </div>
  </div>
</section>

<style>
  .vertical-text {
    writing-mode: vertical-lr;
  }
</style>
