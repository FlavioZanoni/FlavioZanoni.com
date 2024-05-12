import { osStore } from "../store"
import type {
  DirectoryBlock,
  FileBlock,
  OSStore,
  Position,
  Size,
} from "../store/types"
import { isFileBlock } from "./fileSystemUtils"

export const openApp = (appId: string) => {
  let newItem = {
    name: null,
    isMinimized: false,
    isMaximized: false,
    isFocused: true,
    uuid: crypto.randomUUID().toString(),
  }

  const item = {
    iNode: appId,
    ...newItem,
  }

  osStore.update((state) => {
    const { iNodes } = state.fileSystem

    let parent: FileBlock | DirectoryBlock
    for (const item in iNodes) {
      parent = iNodes[item].blocks.find((block: FileBlock | DirectoryBlock) => {
        if (!isFileBlock(block)) {
          return block.iNode === appId
        }

        return false
      })

      if (parent) break
    }

    item.name = parent.name
    state.enviroment.openApps.push(item)

    return state
  })
}

export const closeApp = (appUuid: string) => {
  osStore.update((state) => {
    state.enviroment.openApps = state.enviroment.openApps.filter(
      (item) => item.uuid !== appUuid
    )

    return state
  })
}

export const minimizeApp = (
  appUuid: string,
  lastPos: Position,
  lastSize: Size
) => {
  osStore.update((state) => {
    const thisApp = state.enviroment.openApps.find(
      (app) => app.uuid === appUuid
    )
    thisApp.isMinimized = true
    thisApp.lastPos = { x: lastPos.x, y: lastPos.y }
    thisApp.lastSize = { width: lastSize.width, height: lastSize.height }

    state.enviroment.openApps = state.enviroment.openApps.map((app) => {
      if (app.uuid === appUuid) {
        return thisApp
      }

      return app
    })

    return state
  })
}

export const maximizeApp = (
  appUuid: string,
  lastPos: Position,
  lastSize: Size
) => {
  osStore.update((state) => {
    const thisApp = state.enviroment.openApps.find(
      (app) => app.uuid === appUuid
    )

    if (thisApp.isMaximized) {
      thisApp.lastPos = { x: lastPos.x, y: lastPos.y }
      thisApp.lastSize = { width: lastSize.width, height: lastSize.height }
    }
    thisApp.isMaximized = !thisApp.isMaximized

    state.enviroment.openApps = state.enviroment.openApps.map((app) => {
      if (app.uuid === appUuid) {
        return thisApp
      }

      return app
    })

    return state
  })
}

export const focusApp = (appUuid: string) => {
  osStore.update((state) => {
    state.enviroment.openApps.forEach((item) => {
      item.isFocused = item.uuid === appUuid
    })

    return state
  })
}

export const isAppOpen = (appId: string) => {
  let state: OSStore
  osStore.subscribe((value) => {
    state = value
  })

  return state.enviroment.openApps.some((item) => item.iNode === appId)
}
