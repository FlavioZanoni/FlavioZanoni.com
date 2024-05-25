import jsonState from "@lib/store/state.json"
import { writable } from "svelte/store"
import type { OSStore } from "./types"

export const osStore = writable<OSStore>(jsonState as unknown as OSStore)

osStore.subscribe((value) => {
  console.log(value)

  if (value.fileSystem.iNodes["10"].blocks.length) {
    if (value.fileSystem.disk.apps["recycleBin"].icon !== "trash.png") return

    value.fileSystem.disk.apps["recycleBin"].icon = "trash-full.png"
    return
  }
  value.fileSystem.disk.apps["recycleBin"].icon = "trash.png"
})
