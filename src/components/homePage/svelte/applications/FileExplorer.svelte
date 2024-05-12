<script lang="ts">
  import { osStore } from "@lib/store"
  import { isFileBlock } from "@lib/utils/fileSystemUtils"
  import type { DefaultItem, DirectoryBlock, FileBlock } from "@lib/store/types"
  type Dir = { name: string; hasChildren: boolean }

  export let iNode: string
  export let name: string

  let directories: Dir[] = []
  let files: DefaultItem[] = []

  $: {
    const { iNodes } = $osStore.fileSystem
    let blocks = $osStore.fileSystem.iNodes[iNode].blocks

    blocks.forEach((block: FileBlock | DirectoryBlock) => {
      if (isFileBlock(block)) {
        files.push($osStore.fileSystem.disk[block.location][block.name])
      } else {
        directories.push({
          hasChildren: iNodes[block.iNode].blocks.length > 0,
          name: block.name,
        })
      }
    })
  }
</script>

<div class="flex flex-row w-full h-full">
  <div class="w-1/5 border-r border-gray-500">
    <h1>directory tree</h1>
  </div>
  <div class="flex flex-col justify-between h-full w-full">
    <div
      class="flex flex-row justify-between gap-4 p-1 border-b border-gray-500"
    >
      <h2>
        Showing contents of: {name}
      </h2>
    </div>

    <div class="h-full">
      {#if files.length || directories.length}
        {#each directories as directory}
          <p>{directory.name}</p>
        {/each}
        {#each files as file}
          <p>{file.name}</p>
        {/each}
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
