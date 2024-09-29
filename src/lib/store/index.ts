import jsonState from "@lib/store/state.json"
import { writable } from "svelte/store"
import type { OSStore } from "./types"

const RECYCLE_BIN_INODE = "6"
const HOME_INODE = "2"

const osStore = writable<OSStore>(jsonState as unknown as OSStore)
osStore.subscribe((value) => {
  if (import.meta.env.DEV) {
    console.log(value)
  }

  if (value.fileSystem.iNodes[RECYCLE_BIN_INODE].blocks.length) {
    if (value.fileSystem.disk.apps["recycleBin"].icon !== "trash.png") return

    value.fileSystem.disk.apps["recycleBin"].icon = "trash-full.png"
    return
  }
  value.fileSystem.disk.apps["recycleBin"].icon = "trash.png"
})

export { RECYCLE_BIN_INODE, HOME_INODE, osStore } 
