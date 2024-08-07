import { cd, ls, mkdir, mv, touch } from "@lib/utils/fileSystemUtils"
import { FitAddon } from "@xterm/addon-fit"
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
  "mv",
] as const

export class Term {
  constructor(public term: TerminalType) {}

  private pwd = "root"
  private writtenLines = 0
  private fitAddon: FitAddon

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

  private getDecorationString() {
    const currentPwd = this.pwd
    const emoji = currentPwd === "root" ? "⌂" : "☺"
    return `\x1B[34m${emoji} ${currentPwd}\x1B[32m ❯\x1B[0m `
  }

  public setup(dir: string, uuid: string) {
    this.setPwd(dir)

    const termDiv = document.getElementById(`terminal-${uuid}`)
    this.term.open(termDiv)

    this.term.writeln("Welcome to the terminal!")
    this.term.writeln("Type 'help' to get started.")
    this.term.options.cursorInactiveStyle = "block"
    this.term.options.cursorBlink = true
    this.term.options.fontFamily = "IBM"
    this.term.options.lineHeight = 1.4
    this.term.write(this.getDecorationString())

    this.term.onBell(() => {
      this.playBeep()
    })

    this.term.onLineFeed(() => {
      this.writtenLines++
    })

    this.term.onData((data) => {
      switch (data) {
        case "\r":
          const lastLine = this.term.buffer.active.getLine(this.writtenLines)
          const lastLineText = lastLine.translateToString().trim()
          if (lastLineText.length === this.pwd.length + 4) {
            this.writeln("")
            break
          }
          this.execCommand(lastLineText)
          break
        case "\x7f":
          // pwd + 5 is the length of the prompt decoration
          if (this.term.buffer.active.cursorX === this.pwd.length + 5) {
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
    this.term.writeln(str)
    this.term.write(this.getDecorationString())
  }

  public getPwd() {
    return this.pwd
  }

  //needs to be arrow fn or bind this in the constructor
  public setPwd = (newPwd: string) => {
    this.pwd = newPwd
  }

  public loadFitAddon = () => {
    this.fitAddon = new FitAddon()
    this.term.loadAddon(this.fitAddon)
  }

  public fit = () => {
    if (this.fitAddon === undefined) {
      throw new Error("fitAddont is not loaded")
    }

    this.fitAddon.fit()
  }

  public execCommand(str: string) {
    const [_, typed] = str.split("❯")
    const [command, ...args] = typed
      .trim()
      .split(" ")
      .map((arg) => arg.trim())

    this.term.writeln("")
    switch (command as (typeof availabeleCommands)[number]) {
      case "echo":
        return this.writeln(args.join(" "))
      case "clear":
        this.term.clear()
        this.writtenLines = 0
        return this.term.write(this.getDecorationString())
      case "pwd":
        return this.writeln(this.pwd)
      case "ls":
        let files = ls(this.pwd)
        return this.writeln(files.join(" "))
      case "touch":
        try {
          touch(args[0], this.pwd)
          this.term.write(this.getDecorationString())
        } catch (e) {
          return this.writeln(`touch: ${e.message || "Error"}`)
        }
        return
      case "mkdir":
        try {
          mkdir(args[0], this.pwd)
          this.term.write(this.getDecorationString())
        } catch (e) {
          return this.writeln(`mkdir: ${e.message || "Error"}`)
        }
        return
      case "cd":
        try {
          cd(args[0], this.pwd, this.setPwd)
          this.term.write(this.getDecorationString())
        } catch (e) {
          return this.writeln(`cd: ${e.message || "Error"}`)
        }
        return
      case "mv":
        try {
          mv(args[0], args[1], this.pwd)
          this.term.write(this.getDecorationString())
        } catch (e) {
          return this.writeln(`mv: ${e.message || "Error"}`)
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
