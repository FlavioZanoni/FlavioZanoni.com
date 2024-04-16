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

export const pwd = () => {
  let pwd: string

  osStore.subscribe((state) => {
    pwd = state.enviroment.PWD
  })

  return pwd
}

const iNodeLookup = (dir: string) => {
  const startINode = 1 // my root directory
  let iNode: string

  if (dir === "root") {
    return startINode.toString()
  }

  osStore.subscribe((state) => {
    const { iNodes } = state.fileSystem
    let currentINode = iNodes[startINode]

    const path = dir
      .trim()
      .split("/")
      .filter((dirName) => dirName !== "root")

    console.log("path", path)

    path.forEach((dirName) => {
      if (!dirName) return
      if (isDirectoryBlockArray(currentINode.blocks)) {
        const block = currentINode.blocks.find(
          (block) => block.name === dirName
        )
        if (!block) {
          throw new Error("Directory not found")
        }
        currentINode = iNodes[block.iNode]
        iNode = block.iNode
      }
    })
  })

  return iNode
}

export const touch = (name: string) => {
  if (!name) {
    throw new Error("missing file operand")
  }

  const dir = pwd()
  const parent = iNodeLookup(dir)

  osStore.update((state) => {
    const { disk, iNodes } = state.fileSystem
    const iNode = Object.keys(iNodes).length + 1
    const [fileName, ext] = name.split(".")

    const parentINode = iNodes[parent]
    if (!parentINode) {
      throw new Error("parent not found")
    }
    if (isDirectoryBlockArray(parentINode.blocks)) {
      parentINode.blocks.push({
        name,
        iNode: iNode.toString(),
      })
    } else {
      throw new Error("parent is not a directory")
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

export const mkdir = (name: string) => {
  if (!name) {
    throw new Error("missing file operand")
  }

  const dir = pwd()
  const parent = iNodeLookup(dir)

  osStore.update((state) => {
    const { iNodes } = state.fileSystem
    const iNode = Object.keys(iNodes).length + 1

    const parentINode = iNodes[parent]
    if (!parentINode) {
      throw new Error("parent not found")
    }
    if (isDirectoryBlockArray(parentINode.blocks)) {
      parentINode.blocks.push({
        name,
        iNode: iNode.toString(),
      })
    } else {
      throw new Error("parent is not a directory")
    }

    iNodes[iNode] = {
      type: "directory",
      blocks: [],
    }

    return state
  })
}

export const cd = (dir: string) => {
  if (!dir) {
    throw new Error("missing directory operand")
  }

  let currentPwd = pwd()
  const parent = iNodeLookup(currentPwd)
  let newPwd: string

  osStore.update((state) => {
    const { iNodes } = state.fileSystem
    let parentINode = iNodes[parent]
    if (!parentINode) {
      throw new Error("parent not found")
    }

    if (isDirectoryBlockArray(parentINode.blocks)) {
      const splitDir = dir.split("/")

      splitDir.forEach((dir) => {
        if (!dir) return
        if (dir === ".." && currentPwd === "root") {
          return
        }
        if (dir === "..") {
          const path = currentPwd.split("/")
          path.pop()
          newPwd = path.join("/")
          state.enviroment.PWD = newPwd
          currentPwd = newPwd
          return
        }

        const dirBlock = parentINode.blocks.find((block) => block.name === dir)
        if (!dirBlock) {
          throw new Error("directory not found")
        }
        if (isFileBlock(dirBlock)) {
          throw new Error("not a directory")
        } else {
          parentINode = iNodes[dirBlock.iNode]
        }
        newPwd = `${currentPwd}/${dir}`
        state.enviroment.PWD = newPwd
        currentPwd = newPwd
      })
    } else {
      throw new Error("parent is not a directory")
    }
    return state
  })
}

export const ls = () => {
  const currentPwd = pwd()
  const parent = iNodeLookup(currentPwd)
  let items: string[]

  osStore.subscribe((state) => {
    const parentINode = state.fileSystem.iNodes[parent]

    if (isDirectoryBlockArray(parentINode.blocks)) {
      items = parentINode.blocks.map((block) => block.name)
    }
  })

  return items
}
