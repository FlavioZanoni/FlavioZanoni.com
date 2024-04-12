import jsonState from "@lib/store/state.json"
import { writable } from "svelte/store"
import type { OSStore } from "./types"

export const osStore = writable<OSStore>(jsonState as unknown as OSStore)

osStore.subscribe((value) => {
  console.log(value)
})
