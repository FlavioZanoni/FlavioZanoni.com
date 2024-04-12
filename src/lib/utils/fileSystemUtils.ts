import { osStore } from "@lib/store"
import type {
  DefaultItem,
  DirectoryBlock,
  Disk,
  EnviromentItem,
  FileBlock,
  INode,
} from "@lib/store/types"

function isFileBlock(block: FileBlock | DirectoryBlock): block is FileBlock {
  return "location" in block
}

export const getItemByINode = (appId: string): DefaultItem | DirectoryBlock => {
  let disk: Disk
  let iNodes: INode

  osStore.subscribe((state) => {
    disk = state.fileSystem.disk
    iNodes = state.fileSystem.iNodes
  })

  const iNodeObj = iNodes[appId]

  if (!iNodeObj) {
    return
  }

  if (!isFileBlock(iNodeObj.blocks[0])) {
    return iNodeObj.blocks[0]
  } else {
    const block = iNodeObj.blocks[0]
    return disk[block.location][block.name]
  }
}

export type GetItemsInArrayByINode = {
  [key: string]: DefaultItem | DirectoryBlock
}

export const getItemsInArrayByINode = (
  arr: EnviromentItem[]
): GetItemsInArrayByINode => {
  const items: GetItemsInArrayByINode = {}
  arr.forEach((item) => {
    if (!item.iNode) return
    items[item.iNode] = getItemByINode(item.iNode)
  })

  return items
}
