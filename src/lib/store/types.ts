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
    type: "directory" | "file"
    blocks: FileBlock[] | DirectoryBlock[]
  }
}

export type FileBlock = {
  location: string
  name: string
}

export type DirectoryBlock = {
  name: string
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
  link?: string
  appName?: string
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
