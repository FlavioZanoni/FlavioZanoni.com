<script lang="ts">
  import { osStore } from "@lib/store"
  import { openApp } from "@lib/utils/enviromentUtils"
  import { getItemsInArrayByINode } from "@lib/utils/fileSystemUtils"
  import { onMount } from "svelte"
  import Button from "./Button.svelte"

  export let id: string

  let left = "0px"
  let bottom = "0px"

  const itemsByINode = getItemsInArrayByINode($osStore.enviroment.menu.items)

  onMount(() => {
    const menuBtn = document.getElementById("menuBtn")
    const menuBtnRect = menuBtn.getBoundingClientRect()
    left = `${menuBtnRect.left}px`
    bottom = `${window.innerHeight - menuBtnRect.bottom + menuBtnRect.height + 1}px` // 1 is for the border
  })
</script>

<section
  {id}
  style="left: {left}; bottom: {bottom}; "
  class="w-[400px] h-[600px] bg-slate-400 absolute p-2 pl-0 border border-slate-900 z-10"
>
  <div class="flex h-full w-full gap-4">
    <div class="bg-slate-300 w-12 h-full flex items-end">
      <h2 class="vertical-text transform rotate-180 mb-2 text-center">
        Flávio Zanoni Gallon
      </h2>
    </div>
    <div class="flex flex-col w-full items-start">
      {#each $osStore.enviroment.menu.items as item, index (item.iNode)}
        {@const currentItem = itemsByINode[item.iNode]}
        <Button
          variant="secondary"
          customCss="w-full"
          id={index.toString()}
          on:click={() => {
            openApp(item.iNode)
          }}
        >
          {currentItem.name}
        </Button>
      {/each}
    </div>
  </div>
</section>

<style>
  .vertical-text {
    writing-mode: vertical-lr;
  }
</style>
