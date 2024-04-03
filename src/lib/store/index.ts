import jsonState from "@lib/store/state.json"
import { writable } from "svelte/store"
import type { DesktopStore } from "./types"

export const desktopStore = writable<DesktopStore>(jsonState as DesktopStore)

desktopStore.subscribe((value) => {
  console.log(value)
})
