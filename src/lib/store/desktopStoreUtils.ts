import { desktopStore } from "."
import type {
  DefaultItem,
  DesktopStore,
  HomeGridItem,
  Position,
  Size,
} from "./types"

export const exportCurrentDesktopStore = () => {
  const data = JSON.stringify(desktopStore)
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "desktopStore.json"
  a.click()
  URL.revokeObjectURL(url)
}

export const saveCurrentDesktopStore = () => {
  localStorage.setItem("state", JSON.stringify(desktopStore))
}

export const openApp = (
  appId: string,
  location: "desktop" | "menu" = "desktop"
) => {
  /*   if (isAppOpen(appId)) {
    return
  } */

  let state: DesktopStore
  desktopStore.subscribe((value) => {
    state = value
  })

  let newItem = {
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    isFocused: true,
    uuid: crypto.randomUUID().toString(),
  }

  let app: HomeGridItem | DefaultItem
  switch (location) {
    case "menu":
      app = state.menu.items.find((item) => item.id === appId)
      break
    default:
      app = state.homeGrid.items.find((item) => item.id === appId)
      break
  }

  const item = {
    ...app,
    ...newItem,
  }

  desktopStore.update((state) => {
    state.openApps.push(item)
    state.taskbar.openApps.push(item)

    return state
  })
}

export const closeApp = (appUuid: string) => {
  desktopStore.update((state) => {
    state.openApps = state.openApps.filter((item) => item.uuid !== appUuid)
    state.taskbar.openApps = state.taskbar.openApps.filter(
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
  desktopStore.update((state) => {
    const thisApp = state.openApps.find((app) => app.uuid === appUuid)
    thisApp.isMinimized = true
    thisApp.lastPos = { x: lastPos.x, y: lastPos.y }
    thisApp.lastSize = { width: lastSize.width, height: lastSize.height }

    state.openApps = state.openApps.map((app) => {
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
  desktopStore.update((state) => {
    const thisApp = state.openApps.find((app) => app.uuid === appUuid)

    if (thisApp.isMaximized) {
      thisApp.lastPos = { x: lastPos.x, y: lastPos.y }
      thisApp.lastSize = { width: lastSize.width, height: lastSize.height }
    }
    thisApp.isMaximized = !thisApp.isMaximized

    state.openApps = state.openApps.map((app) => {
      if (app.uuid === appUuid) {
        return thisApp
      }

      return app
    })

    return state
  })
}

export const focusApp = (appUuid: string) => {
  desktopStore.update((state) => {
    state.openApps.forEach((item) => {
      item.isFocused = item.uuid === appUuid
    })

    return state
  })
}

export const isAppOpen = (appId: string) => {
  let state: DesktopStore
  desktopStore.subscribe((value) => {
    state = value
  })

  return state.openApps.some((item) => item.id === appId)
}
