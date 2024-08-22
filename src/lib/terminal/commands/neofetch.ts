import { getASCIIArt } from "@lib/utils/getASCIIArt";
import type { Terminal } from "@xterm/xterm";


export const neofetch = (term: Terminal) => {
  const img = getASCIIArt()

  term.writeln("")
  term.writeln(img.trim())
  term.writeln("")
}
