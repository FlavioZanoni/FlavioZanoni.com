import type { Terminal } from "@xterm/xterm"
type TerminalType = InstanceType<typeof Terminal>

const availabeleCommands = ["echo", "clear", "help"] as const

export class Term {
  constructor(public term: TerminalType) {}

  public execCommand(str: string) {
    const [command, ...args] = str.split(" ")
    this.term.writeln("")

    switch (command as (typeof availabeleCommands)[number]) {
      case "echo":
        return this.term.writeln(args.join(" "))
      case "clear":
        return this.term.clear()
      case "help":
        return this.term.writeln(
          `Available commands: ${availabeleCommands.join(", ")}`
        )
      default:
        return this.term.writeln(`Command not found: ${command}`)
    }
  }
}
