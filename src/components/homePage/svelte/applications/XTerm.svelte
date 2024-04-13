<script lang="ts">
  import { Term } from "@lib/terminal"
  import { FitAddon } from "@xterm/addon-fit"
  import { Terminal } from "@xterm/xterm"
  import { onDestroy, onMount } from "svelte"

  export let uuid: string
  export let currentDir: string | undefined = "/"

  let term = new Terminal()
  const termBackend = new Term(term)
  const fitAddon = new FitAddon()

  let observer = new ResizeObserver((_) => {
    fitAddon.fit()
  })

  onMount(() => {
    termBackend.setup(currentDir)
    term.loadAddon(fitAddon)
    fitAddon.fit()

    observer.observe(document.getElementById(`window-${uuid}`))
  })

  onDestroy(() => {
    observer.disconnect()
  })
</script>

<div class="w-full h-full bg-black pt-1" id="terminal"></div>
