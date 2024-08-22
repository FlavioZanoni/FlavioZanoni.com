import { cd, ls, mkdir, mv, touch } from "@lib/utils/fileSystemUtils"
import { FitAddon } from "@xterm/addon-fit"
import type { Terminal } from "@xterm/xterm"
import { neofetch } from "./commands/neofetch"
type TerminalType = InstanceType<typeof Terminal>

//TODO: do better lmao, probably use a dict
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
  "neofetch",
] as const

export class Term {
  constructor(public term: TerminalType) { }

  private pwd = "root"
  private fitAddon: FitAddon
  private currentCommand = ""
  private commandArr: Array<string | undefined> = []
  private lastBeep = 0

  private playBeep() {
    if (Date.now() - this.lastBeep < 183) {
      return 0
    }
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
    this.lastBeep = Date.now()
  }

  private getDecorationString() {
    const currentPwd = this.pwd
    const emoji = currentPwd === "root" ? "⌂" : "☺"
    return `\x1B[34m${emoji} ${currentPwd}\x1B[32m ❯\x1B[0m `
  }

  private handleInput(data: string) {
    const insertPosition = this.term.buffer.active.cursorX - this.pwd.length - 5;
    this.commandArr.splice(insertPosition, 0, data);
    this.currentCommand = this.commandArr.join("");

    // Clear the line from the current cursor position
    this.term.write("\x1b[K");
    this.term.write(this.currentCommand.slice(insertPosition));

    // Move the cursor back to the correct position
    const moveLeft = this.currentCommand.length - insertPosition - 1;
    if (moveLeft > 0) {
      this.term.write(`\x1b[${moveLeft}D`);
    }
  }

  private handleBackspace() {
    // pwd + 5 is the length of the prompt decoration
    if (this.term.buffer.active.cursorX === this.pwd.length + 5) {
      console.log("triggered")
      console.log(this.term.buffer.active.cursorX)
      console.log(this.pwd.length + 5)
      this.term.write("\x07") // trigger bell
      return
    }

    let deletePosition = this.term.buffer.active.cursorX - this.pwd.length - 6;
    this.commandArr.splice(deletePosition, 1);
    this.currentCommand = this.commandArr.join("")
    // Move the cursor back one position
    this.term.write("\b");

    // Clear the rest of the line from the current cursor position
    this.term.write("\x1b[K");
    this.term.write(this.currentCommand.slice(deletePosition));

    // Move the cursor back to the correct position
    let moveLeft = this.currentCommand.length - deletePosition;
    if (moveLeft > 0) {
      this.term.write(`\x1b[${moveLeft}D`);
    }
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

    this.term.onData((data) => {
      this.commandArr = this.currentCommand.split("")
      switch (data) {
        // enter
        case "\r":
          this.execCommand(this.currentCommand)
          this.currentCommand = ""
          break
        // backspace
        case "\x7f":
          this.handleBackspace()
          break

        // up arrow
        case "\x1b[A":
          this.term.write("")
          break
        // down arrow
        case "\x1b[B":
          this.term.write("")
          break

        //left arrow 
        case "\x1b[D":
          if (this.term.buffer.active.cursorX === this.pwd.length + 5) {
            this.term.write("\x07") // trigger bell
            break
          }
          this.term.write("\b")
          break
        //right arrow
        case "\x1b[C":
          if (this.term.buffer.active.cursorX === this.currentCommand.length + this.pwd.length + 5) {
            this.term.write("\x07") // trigger bell
            break
          }
          this.term.write("\x1b[C")
          break
        // implement tab later
        case "\t":
          this.term.write("")
          break
        default:
          this.handleInput(data)
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
    const [command, ...args] = str
      .trim()
      .split(" ")
      .map((arg) => arg.trim())

    this.term.writeln("")
    switch (command as (typeof availabeleCommands)[number]) {
      case "echo":
        return this.writeln(args.join(" "))
      case "clear":
        this.term.clear()
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
      case "neofetch":
        neofetch(this.term).then(() => {
          this.term.write(this.getDecorationString())
        })
        return
      default:
        return this.writeln(`Command not found: '${command}', try 'help'`)
    }
  }
}
