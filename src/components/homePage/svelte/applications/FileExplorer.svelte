<script lang="ts">
  import { osStore } from "@lib/store"
  import { getItemByINode, isFileBlock } from "@lib/utils/fileSystemUtils"
  import type {
    DefaultItem,
    DirectoryBlock,
    FileBlock,
    INodes,
  } from "@lib/store/types"
  import FileTree from "./FileTree.svelte"
  import { openApp } from "@lib/utils/enviromentUtils"
  import Button from "../Button.svelte"
  type Dir = { name: string; hasChildren: boolean; iNode: string }

  export let iNode: string = "1"
  export let name: string = "root"

  interface DefaultItemWithId extends DefaultItem {
    id: string
  }

  let currentINode = iNode
  let currentName = name
  let iNodes: INodes = $osStore.fileSystem.iNodes
  let directories: Dir[] = []
  let files: DefaultItemWithId[] = []

  $: {
    directories = []
    files = []
    iNodes = $osStore.fileSystem.iNodes
    let blocks = $osStore.fileSystem.iNodes[currentINode].blocks

    blocks.forEach((block: FileBlock | DirectoryBlock) => {
      if (!isFileBlock(block)) {
        let item = getItemByINode(block.iNode)
        if (item) {
          files.push({ ...item, ...{ id: block.iNode } })
        } else {
          directories.push({
            hasChildren: iNodes[block.iNode].blocks.length > 0,
            name: block.name,
            iNode: block.iNode,
          })
        }
      }
    })
  }

  function updateCurrentDir(iNode: string, name: string) {
    currentINode = iNode
    currentName = name
  }
</script>

<div class="flex flex-row w-full h-full">
  <div class="w-1/4 border-r pl-1 border-gray-500 overflow-auto">
    <FileTree
      iNode={iNodes[1]}
      dirName="root"
      iNodeKey={"1"}
      {updateCurrentDir}
      currentOpen={currentINode}
    />
  </div>
  <div class="flex flex-col justify-between h-full w-full">
    <div
      class="flex flex-row justify-between gap-4 p-1 border-b border-gray-500"
    >
      {#if currentName === "recycleBin"}
        <h2>Recycle Bin</h2>
        <Button variant={"tertiary"}>Empty bin</Button>
      {:else}
        <h2>
          Showing contents of: {currentName}
        </h2>
      {/if}
    </div>

    <div class="h-full">
      {#if files.length || directories.length}
        {#each directories as directory}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="flex gap-1 items-center cursor-pointer"
            on:click={() => updateCurrentDir(directory.iNode, directory.name)}
          >
            <img width="18" height="18" src={`/icons/directory.png`} alt="" />
            <p>{directory.name}</p>
          </div>
        {/each}
        {#each files as file}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:dblclick={() => openApp(file?.id)}
            class="flex gap-1 items-center cursor-pointer"
          >
            <img width="18" height="18" src={`/icons/${file.icon}`} alt="" />
            <p>{file.name}</p>
          </div>
        {/each}
      {:else if currentName === "recycleBin"}
        <p class="text-center mt-10">Recycle bin is empty</p>
      {:else}
        <p class="text-center mt-10">This directory is empty</p>
      {/if}
    </div>

    <div
      class="flex flex-row justify-between gap-4 p-1 border-t border-gray-500"
    >
      <div>
        items: {directories.length + files.length}
      </div>
    </div>
  </div>
</div>
