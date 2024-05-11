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
  let iNodes: INodes

  osStore.subscribe((state) => {
    disk = state.fileSystem.disk
    iNodes = state.fileSystem.iNodes
  })

  const iNodeObj = iNodes[appId]

  if (!iNodeObj || !iNodeObj.blocks[0]) {
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
          name: fileName,
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
  newPwd: string = "",
  getFile?: boolean
) => {
  const parentINode = iNodeLookup(currentPwd)
  let parent = iNodes[parentINode]
  if (!dir || dir === ".") return { newPwd, block: undefined }
  if (dir === ".." && currentPwd === "root") {
    return { newPwd: "root", block: undefined }
  }
  if (dir === "..") {
    const path = currentPwd.split("/")
    path.pop()
    newPwd = path.join("/")
    currentPwd = newPwd
    return { newPwd, block: undefined }
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

  newPwd = `${currentPwd}/${dir}`
  currentPwd = newPwd

  return { newPwd, block: dirBlock, parent, parentINode }
}

export const cd = (
  dir: string,
  pwd: string,
  setPwd: (newPwd: string) => void
) => {
  if (!dir) {
    throw new Error("missing directory operand")
  }

  console.log("pwd on cd", pwd)

  let currentPwd = pwd
  let newPwd: string

  osStore.update((state) => {
    const { iNodes } = state.fileSystem
    const splitDir = dir.split("/")

    splitDir.forEach((dir) => {
      const parent = iNodeLookup(currentPwd)
      let parentINode = iNodes[parent]

      const { newPwd: newCurrentPwd, block } = handleDirNavigation(
        dir,
        iNodes,
        currentPwd,
        newPwd
      )

      newPwd = newCurrentPwd
      setPwd(newPwd)
      currentPwd = newPwd

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
  let newPwd: string
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
      } = handleDirNavigation(dir, iNodes, currentPwd, newPwd, true)
      if (!block) return

      newPwd = newCurrentPwd
      currentPwd = newPwd

      parent = currentParent
      srcINode = parentINode
      if (iNodes[block.iNode].type == "file") {
        node = block.iNode
        return
      }
    })

    return node
  }

  const moveToDest = (node: string, iNodes: INodes) => {
    const splitDir = destination.split("/")
    splitDir.forEach((dir) => {
      const { newPwd: newCurrentPwd, block } = handleDirNavigation(
        dir,
        iNodes,
        currentPwd,
        newPwd
      )
      if (!block) return

      newPwd = newCurrentPwd
      currentPwd = newPwd
    })
    const itemName = parent.blocks.find(
      (item: DirectoryBlock) => item.iNode === node
    ).name

    const whereToMove = iNodeLookup(newPwd)
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
