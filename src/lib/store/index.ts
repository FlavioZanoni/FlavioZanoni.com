import jsonState from "@lib/store/state.json"
import { writable } from "svelte/store"
import type { OSStore } from "./types"

export const osStore = writable<OSStore>(jsonState as unknown as OSStore)

osStore.subscribe((value) => {
  if (
    value.fileSystem.iNodes["10"].blocks.length &&
    value.fileSystem.disk.apps["recycleBin"].icon === "trash.png"
  ) {
    value.fileSystem.disk.apps["recycleBin"].icon = "trash-full.png"
  }

  console.log(value)
})
