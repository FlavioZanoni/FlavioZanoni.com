<script lang="ts">
  import { getItemByINode, isFileBlock, mv } from "@lib/utils/fileSystemUtils"
  import Button from "../Button.svelte"
  import { osStore } from "@lib/store"
  import type { DirectoryBlock, FileBlock } from "@lib/store/types"

  export let iNode: string

  const moveToRecycleBin = () => {
    let iNodes = $osStore.fileSystem.iNodes
    if (iNodes[iNode].type !== "directory") {
      let item = getItemByINode(iNode)
      mv(`./${item.name}`, `../recycleBin`, "root/desktop")
      return
    }

    $osStore.fileSystem.iNodes["2"].blocks.forEach(
      (item: FileBlock | DirectoryBlock) => {
        if (isFileBlock(item)) return
        if (item.iNode === iNode) {
          mv(`./${item.name}`, `../recycleBin`, "root/desktop")
        }
      }
    )
  }

  const emptyRecycleBin = () => {}
</script>

{#if getItemByINode(iNode)?.appName !== "recycleBin"}
  <Button on:click={moveToRecycleBin}>Move to Recycle bin</Button>
{:else}
  <Button on:click={emptyRecycleBin}>Empty Recycle Bin</Button>
{/if}
