import { getState } from "@lib/state"
import { writable } from "svelte/store"

export const state = writable(getState())
