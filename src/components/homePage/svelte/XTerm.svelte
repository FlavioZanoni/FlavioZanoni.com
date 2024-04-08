<script lang="ts">
  import { Term } from "@lib/term"
  import { FitAddon } from "@xterm/addon-fit"
  import { Terminal } from "@xterm/xterm"
  import { onDestroy, onMount } from "svelte"

  export let uuid: string

  let term = new Terminal()
  const termBackend = new Term(term)
  const fitAddon = new FitAddon()

  let observer = new ResizeObserver((_) => {
    fitAddon.fit()
  })

  function playBeep() {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    gainNode.gain.value = 0.5
    oscillator.frequency.value = 510
    oscillator.type = "square"

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.1)
  }

  onMount(() => {
    const termDiv = document.getElementById("terminal")
    term.open(termDiv)

    term.writeln("Welcome to the terminal!")
    term.writeln("Type 'help' to get started.")

    term.loadAddon(fitAddon)
    term.options.cursorBlink = true
    term.onBell(() => {
      playBeep()
    })
    term.options.fontFamily = "IBM"

    term.onData((data) => {
      switch (data) {
        case "\r":
          const lastLine = term.buffer.active.getLine(
            term.buffer.active.cursorY
          )
          const lastLineText = lastLine.translateToString().trim()
          if (lastLineText === "") {
            term.writeln("")
            break
          }
          termBackend.execCommand(lastLineText)
          break
        case "\x7f":
          if (term.buffer.active.cursorX === 0) {
            term.write("\x07") // trigger bell
            break
          }
          term.write("\b \b")
          break
        default:
          term.write(data)
      }
    })

    fitAddon.fit()
    observer.observe(document.getElementById(`window-${uuid}`))
  })

  onDestroy(() => {
    observer.disconnect()
  })
</script>

<div class="w-full h-full bg-black pt-1" id="terminal"></div>
