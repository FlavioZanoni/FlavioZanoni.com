<script lang="ts">
  import jsonState from "@lib/store/state.json"
  import Button from "../Button.svelte"
  import { exportCurrentOSStore } from "@lib/utils/storeUtils"
  import type { OSStore } from "@lib/store/types"
  import { loadOSState } from "@lib/utils/storeUtils"

  const fetchState = async () => {
    const res = await fetch(
      "https://raw.githubusercontent.com/FlavioZanoni/frav.in/refs/heads/main/src/lib/store/state.json"
    )
    const data = await res.json()
    return data
  }

  function handleUploadState(e) {
    const file = (e.target as HTMLInputElement).files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target.result as string
      let res: OSStore
      try {
        res = JSON.parse(result)
        loadOSState(res)
      } catch (err) {
        console.error(err)
        window.alert("Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }

  async function restoreDefault() {
    const state = await fetchState()
    loadOSState(state as unknown as OSStore)
  }

  function applyChanges() {
    let data = document.getElementById("stateArea") as HTMLTextAreaElement
    loadOSState(JSON.parse(data.value) as OSStore)
  }
</script>

<div class="flex flex-col gap-4 p-4 w-full h-full overflow-y-auto">
  <h1 class="text-2xl font-bold">Current OS State:</h1>

  <p>
    This is the current state of the OS, you can import your own state, export
    the current state or reset to the default one
  </p>
  <div class="flex gap-4">
    <Button variant="secondary" on:click={restoreDefault}>Reset state</Button>
    <Button variant="secondary" on:click={exportCurrentOSStore}
      >Export state</Button
    >
  </div>

  <div class="flex flex-col">
    <p class="">Upload your state:</p>
    <input
      on:change={handleUploadState}
      type="file"
      accept="application/json"
    />
  </div>

  <div class="flex gap-2 items-center">
    <div class="w-full h-[1px] bg-gray-900"></div>
    <span>Or</span>
    <div class="w-full h-[1px] bg-gray-900"></div>
  </div>

  <p class="text-lg font-bold">Edit the state:</p>
  <textarea class="h-full min-h-56" id="stateArea"
    >{JSON.stringify(jsonState)}</textarea
  >

  <Button on:click={applyChanges} variant="secondary">Apply changes</Button>
</div>
