import { cd, ls, mkdir, pwd, touch } from "@lib/utils/fileSystemUtils"
import type { Terminal } from "@xterm/xterm"
type TerminalType = InstanceType<typeof Terminal>

const availabeleCommands = [
  "echo",
  "clear",
  "help",
  "touch",
  "mkdir",
  "ls",
  "pwd",
  "cd",
] as const

export class Term {
  constructor(public term: TerminalType) {}

  private playBeep() {
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

  public setup(dir: string) {
    // need to set the PWD to the directory sent

    const termDiv = document.getElementById("terminal")
    this.term.open(termDiv)

    this.term.writeln("Welcome to the terminal!")
    this.term.writeln("Type 'help' to get started.")

    this.term.options.cursorInactiveStyle = "block"
    this.term.options.cursorBlink = true
    this.term.options.fontFamily = "IBM"
    this.term.options.lineHeight = 1.4
    this.term.write(`\x1B[34m⌂ ${pwd()}\x1B[32m ❯\x1B[0m `)

    this.term.onBell(() => {
      this.playBeep()
    })

    this.term.onData((data) => {
      console.log(data)

      switch (data) {
        case "\r":
          const lastLine = this.term.buffer.active.getLine(
            this.term.buffer.active.cursorY
          )
          const lastLineText = lastLine.translateToString().trim()
          if (lastLineText === "") {
            this.term.writeln("")
            break
          }
          this.execCommand(lastLineText)
          break
        case "\x7f":
          if (this.term.buffer.active.cursorX === pwd().length + 5) {
            // pwd + 5 is the length of the prompt decoration
            this.term.write("\x07") // trigger bell
            break
          }
          this.term.write("\b \b")
          break

        // implement arrowKeys later
        case "\x1b[A":
          this.term.write("")
          break
        case "\x1b[B":
          this.term.write("")
          break
        case "\x1b[C":
          this.term.write("")
          break
        case "\x1b[D":
          this.term.write("")
          break

        // implement tab later
        case "\t":
          this.term.write("")
          break
        default:
          this.term.write(data)
      }
    })
  }

  public writeln(str: string) {
    const currentPwd = pwd()
    const emoji = currentPwd === "root" ? "⌂" : "☺"

    this.term.write(`\x1B[34m${emoji} ${pwd()}\x1B[32m ❯\x1B[0m `)
    this.term.writeln(str)
    this.term.write(`\x1B[34m${emoji} ${pwd()}\x1B[32m ❯\x1B[0m `)
  }

  public execCommand(str: string) {
    const [start, typed] = str.split("❯").map((str) => str.trim())
    const [command, ...args] = typed.split(" ").map((arg) => arg.trim())
    this.term.writeln("")

    switch (command as (typeof availabeleCommands)[number]) {
      case "echo":
        return this.writeln(args.join(" "))
      case "clear":
        return this.term.clear()
      case "pwd":
        const curr = pwd()
        return this.writeln(curr)
      case "ls":
        let files = ls()
        return this.writeln(files.join(" "))
      case "touch":
        try {
          touch(args[0])
          this.writeln("")
        } catch (e) {
          return this.writeln(`touch: ${e.message || "Error"}`)
        }
        return
      case "mkdir":
        try {
          mkdir(args[0])
          this.writeln("")
        } catch (e) {
          return this.writeln(`mkdir: ${e.message || "Error"}`)
        }
        return
      case "cd":
        try {
          cd(args[0])
          this.writeln("")
        } catch (e) {
          return this.writeln(`cd: ${e.message || "Error"}`)
        }
        return
      case "help":
        return this.writeln(
          `Available commands: ${availabeleCommands.join(", ")}`
        )
      default:
        return this.writeln(`Command not found: ${command}, try 'help'`)
    }
  }
}
