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
function isDirectoryBlockArray(
  blocks: FileBlock[] | DirectoryBlock[]
): blocks is DirectoryBlock[] {
  return blocks.length === 0 || "iNode" in blocks[0]
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

export const createFile = (name: string, parent: string) => {
  osStore.update((state) => {
    const { disk, iNodes } = state.fileSystem
    const iNode = Object.keys(iNodes).length + 1
    const [fileName, ext] = name.split(".")

    const parentINode = iNodes[parent]
    if (!parentINode) {
      throw new Error("Parent not found")
    }
    if (isDirectoryBlockArray(parentINode.blocks)) {
      parentINode.blocks.push({
        name,
        iNode: iNode.toString(),
      })
    } else {
      throw new Error("Parent is not a directory")
    }

    iNodes[iNode] = {
      type: "file",
      blocks: [
        {
          name,
          location: "files",
        },
      ],
    }

    disk.files[fileName] = {
      name: fileName,
      type: "file",
      content: "",
      icon: "document.png",
      ext,
    }

    return state
  })
}
