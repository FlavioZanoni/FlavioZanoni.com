import { osStore } from "@lib/store"
import type {
  DefaultItem,
  DirectoryBlock,
  Disk,
  EnviromentItem,
  FileBlock,
  INode,
  INodes,
} from "@lib/store/types"

export function isFileBlock(
  block: FileBlock | DirectoryBlock
): block is FileBlock {
  return "location" in block
}

function isDirectoryBlockArray(
  blocks: FileBlock[] | DirectoryBlock[]
): blocks is DirectoryBlock[] {
  return blocks.length === 0 || "iNode" in blocks[0]
}

export const getItemByINode = (appId: string): DefaultItem | null => {
  let disk: Disk
  let iNodes: INodes

  osStore.subscribe((state) => {
    disk = state.fileSystem.disk
    iNodes = state.fileSystem.iNodes
  })

  const iNodeObj = iNodes[appId]

  if (!iNodeObj || !iNodeObj.blocks[0]) {
    return null
  }

  if (isFileBlock(iNodeObj.blocks[0])) {
    const block = iNodeObj.blocks[0]
    return disk[block.location][block.name]
  }
}

export const getItemInDiskByFile = (file: FileBlock): DefaultItem | null => {
  let item: DefaultItem | null = null
  osStore.subscribe((state) => {
    item = state.fileSystem.disk[file.location][file.name]
  })

  return item
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

export const iNodeLookup = (dir: string) => {
  const startINode = 1 // the root directory
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

export const touch = (name: string, pwd: string) => {
  if (!name) {
    throw new Error("missing file operand")
  }

  const dir = pwd
  const parent = iNodeLookup(dir)

  osStore.update((state) => {
    const { disk, iNodes } = state.fileSystem
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
      type: "file",
      blocks: [
        {
          name: name,
          location: "files",
        },
      ],
    }

    disk.files[name] = {
      name: name,
      type: "file",
      content: "",
      icon: "document.png",
    }

    return state
  })
}

export const mkdir = (name: string, pwd: string) => {
  if (!name) {
    throw new Error("missing file operand")
  }

  const dir = pwd
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

const handleDirNavigation = (
  dir: string,
  iNodes: INodes,
  currentPwd: string,
  getFile?: boolean
) => {
  const parentINode = iNodeLookup(currentPwd)
  let parent = iNodes[parentINode]
  if (!dir || dir === ".") return { newPwd: currentPwd, block: undefined }
  if (dir === ".." && currentPwd === "root") {
    return { newPwd: "root", block: undefined }
  }
  if (dir === "..") {
    const path = currentPwd.split("/")
    path.pop()
    return { newPwd: path.join("/"), block: undefined }
  }

  const dirBlock = parent.blocks.find(
    (block) => block.name === dir
  ) as DirectoryBlock

  if (!dirBlock) {
    if (getFile) {
      throw new Error(`file ${dir} not found`)
    }
    throw new Error(`directory ${dir} not found`)
  }

  if (!getFile) {
    if (iNodes[dirBlock.iNode].type == "file") {
      throw new Error(`${dir} is not a directory`)
    }
  }

  return {
    newPwd: `${currentPwd}/${dir}`,
    block: dirBlock,
    parent,
    parentINode,
  }
}

export const cd = (
  dir: string,
  pwd: string,
  setPwd: (newPwd: string) => void
) => {
  if (!dir) {
    throw new Error("missing directory operand")
  }

  let currentPwd = pwd

  osStore.update((state) => {
    const { iNodes } = state.fileSystem
    const splitDir = dir.split("/")

    splitDir.forEach((dir) => {
      const parent = iNodeLookup(currentPwd)
      let parentINode = iNodes[parent]

      const { newPwd: newCurrentPwd, block } = handleDirNavigation(
        dir,
        iNodes,
        currentPwd
      )
      setPwd(newCurrentPwd)
      currentPwd = newCurrentPwd

      if (!block) return

      if (iNodes[block.iNode].type == "file") {
        throw new Error("not a directory")
      } else {
        parentINode = iNodes[block.iNode]
      }
    })
    return state
  })
}

export const mv = (source: string, destination: string, pwd: string) => {
  if (!source) {
    throw new Error("missing directory operand")
  }
  if (!destination) {
    throw new Error("missing destination operand")
  }

  let currentPwd = pwd
  let fileINode: string
  let srcINode: string
  let parent: INode
  const getSourceNode = (iNodes: INodes) => {
    const splitDir = source.split("/")
    let node: string
    splitDir.forEach((dir) => {
      const {
        newPwd: newCurrentPwd,
        block,
        parent: currentParent,
        parentINode,
      } = handleDirNavigation(dir, iNodes, currentPwd, true)
      if (!block) return

      currentPwd = newCurrentPwd
      console.log("currentPArent", currentParent)
      parent = currentParent
      srcINode = parentINode
      node = block.iNode
      return
    })

    return node
  }

  const moveToDest = (node: string, iNodes: INodes) => {
    const splitDir = destination.split("/")
    splitDir.forEach((dir) => {
      const { newPwd: newCurrentPwd } = handleDirNavigation(
        dir,
        iNodes,
        currentPwd
      )
      currentPwd = newCurrentPwd
    })

    const itemName = parent.blocks.find(
      (item: DirectoryBlock) => item.iNode === node
    ).name
    const whereToMove = iNodeLookup(currentPwd)
    const itemToMove: DirectoryBlock = {
      name: itemName,
      iNode: node,
    }
    iNodes[whereToMove].blocks.push(itemToMove as any) //FIXME: dont really know, the type is correct with the | operator, but push changes it to an &
  }

  osStore.update((state) => {
    const { iNodes } = state.fileSystem

    fileINode = getSourceNode(iNodes)
    currentPwd = pwd // reset the pwd to use in the dest validation
    moveToDest(fileINode, iNodes)
    // remove from last place
    const filtered = iNodes[srcINode].blocks.filter(
      (item: DirectoryBlock) => item.iNode !== fileINode
    ) as FileBlock[] | DirectoryBlock[]
    state.fileSystem.iNodes[srcINode].blocks = filtered

    return state
  })
}

export const ls = (pwd: string) => {
  const currentPwd = pwd
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
