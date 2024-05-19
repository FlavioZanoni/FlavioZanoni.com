<script lang="ts">
  import { osStore } from "@lib/store"
  import type {
    DirectoryBlock,
    FileBlock,
    INode,
    INodes,
  } from "@lib/store/types"
  import { isFileBlock } from "@lib/utils/fileSystemUtils"
  import clsx from "clsx"
  export let iNode: INode
  export let dirName: string
  export let depth: number | null = 0
  export let iNodeKey: string
  export let updateCurrentDir: (iNode: string, name: string) => void
  export let currentOpen: string

  let isExpanded = false
  let iNodes: INodes
  let blocks = iNode.blocks as DirectoryBlock[]

  const recursiveCheck = (blocks: DirectoryBlock[] | FileBlock[]) => {
    return !!blocks.find((item) => {
      if (!isFileBlock(item)) {
        if (currentOpen == item.iNode) return true
        return recursiveCheck(iNodes[item.iNode].blocks)
      }
    })
  }

  $: {
    isExpanded = false
    iNodes = $osStore.fileSystem.iNodes
    blocks = iNode.blocks as DirectoryBlock[]

    if (iNodeKey === currentOpen) {
      isExpanded = true
    }
    if (recursiveCheck(iNode.blocks)) {
      isExpanded = true
    }
  }

  function handleClick(e: MouseEvent) {
    handleExpand(e)
    updateCurrentDir(iNodeKey, dirName)
  }

  function handleExpand(e: MouseEvent) {
    e.stopPropagation()
    isExpanded = !isExpanded
  }
</script>

{#if iNode.type === "directory"}
  <div class="flex gap-1 items-center" style="margin-left: {depth * 0.7}rem ">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class={clsx("gap-1 flex flex-row cursor-pointer")}>
      <button
        on:click={handleExpand}
        class={clsx(isExpanded && "rotate-90 text-xl")}
      >
        ›
      </button>

      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={handleClick} class="gap-1 flex flex-row items-center">
        <img
          alt="directory"
          width="20"
          height="20"
          class="w-5 h-5"
          src={dirName === "recycleBin"
            ? "/icons/trash.png"
            : `/icons/directory.png`}
        />
        <p>{dirName === "recycleBin" ? "Recycle bin" : dirName}</p>
      </div>
    </div>
  </div>

  {#if isExpanded}
    {#each blocks as block}
      <!-- {@const item = getItemByINode(block.iNode)}
      {#if item}
        <div
          class="flex gap-1 items-center"
          style="margin-left: {(depth + 1) * 0.7}rem"
        >
          <img width="18" height="18" src={`/icons/${item.icon}`} alt="" />
          <p>{item.name}</p>
        </div>
      {:else} -->
      <svelte:self
        iNode={iNodes[block.iNode]}
        dirName={block.name}
        iNodeKey={block.iNode}
        depth={(depth += 1)}
        {updateCurrentDir}
        {currentOpen}
      ></svelte:self>
      <!-- {/if} -->
    {/each}
  {/if}
{/if}
