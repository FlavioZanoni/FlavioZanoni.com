export type OSStore = {
  enviroment: Enviroment
  fileSystem: FileSystem
}

export interface Enviroment {
  homeGrid: {
    items: HomeGridItem[]
    size: {
      rows: number
      columns: number
    }
  }
  taskbar: {
    items: EnviromentItem[]
  }
  menu: {
    items: EnviromentItem[]
  }
  openApps: OpenApp[]
  PWD: string
  background: {
    fileName?: string
    base64?: string
    color?: string
    userImages: {
      fileName: string
      base64: string
    }[]
  }
}

export interface FileSystem {
  iNodes: INode
  disk: Disk
}

export interface INode {
  [key: string]: {
    type: ItemType
    blocks: FileBlock[] | DirectoryBlock[]
  }
}

type Block = {
  name: string
}

export interface FileBlock extends Block {
  location: "apps" | "files"
}

export interface DirectoryBlock extends Block {
  iNode: string
}

export type Disk = {
  [key in "apps" | "files"]: DefaultItem[]
}

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export interface EnviromentItem {
  iNode?: string
}

export interface HomeGridItem extends EnviromentItem {
  type: ItemType
  pos: Position
}

export type ItemType = "directory" | "file" | "app" | "empty"

export interface DefaultItem {
  icon: string
  name: string
  type: ItemType
  ext?: string
  link?: string
  appName?: string
  content?: string
}

export interface OpenApp {
  iNode: string
  uuid: string
  isMaximized: boolean
  isMinimized: boolean
  isFocused: boolean
  lastPos?: Position
  lastSize?: Size
}
