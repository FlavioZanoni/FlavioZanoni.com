import { getASCIIArt } from "@lib/utils/getASCIIArt";
import { getNetworkInfo, getScreenInfo, getStorageInfo, getSystemInfo } from "@lib/utils/systemInfoUtils";
import type { Terminal } from "@xterm/xterm";

const getWidthNotIncludingAnsi = (str: string) => {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "").length
}

export const neofetch = async (term: Terminal) => {
  const img = getASCIIArt()
  const splitted = img.split("\n")
  let imageWidth = getWidthNotIncludingAnsi(splitted[0])
  let sysInfo = await getSystemInfo()
  const storageInfo = await getStorageInfo()
  const screenInfo = getScreenInfo()
  const networkInfo = getNetworkInfo()
  const targetColumn = imageWidth + 2
  const moveCursor = `\x1b[${targetColumn}G`;

  let info = {
    "OS": sysInfo.os,
    "OS Version": sysInfo.osVersion,
    "Kernel": sysInfo.platform,
    "Display": `${screenInfo.width}x${screenInfo.height} ${screenInfo.colorDepth}bit`,
    "Font": "IBM_VGA",
    "Cursor": "Win95",
    "Terminal": "xterm.js",
    "Cores": sysInfo.cores,
    "Memory": sysInfo.memory + "GB",
    "Disk Usage": `${storageInfo.usage.toFixed(2)}MB/${storageInfo.quota.toFixed(2)}MB`,
    "Network": networkInfo.online ? "Online" : "Offline",
    "battery": sysInfo.battery ? `${sysInfo.battery.level * 100}% [${sysInfo.battery.charging ? "\x1b[32mcharging\x1b[0m" : "\x1b[0mdischarging\x1b[0m"}]` : "N/A",
    "Locale": sysInfo.language,
    "": `\x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[m  \n${moveCursor}  \x1b[100m   \x1b[101m   \x1b[102m   \x1b[103m   \x1b[104m   \x1b[105m   \x1b[106m   \x1b[107m   \x1b[m`,
  }

  const loopSize = Math.max(Object.keys(info).length, splitted.length)

  term.writeln("")
  for (let i = 0; i < loopSize; i++) {
    const currValue = Object.values(info)[i]
    const currKey = Object.keys(info)[i]
    if (i < splitted.length) {
      const imageLine = splitted[i]
      if (!currValue) {
        term.writeln(`${imageLine}${moveCursor}`)
        continue
      } else {
        term.writeln(`${imageLine}${moveCursor} \x1b[38;2;95;205;228m ${currKey ? currKey + ": " : ""}\x1b[37m${Object.values(info)[i]}`);
      }
    } else {
      if (!currKey) continue
      term.writeln(`${moveCursor} ${currKey ? currKey + ": " : ""}${Object.values(info)[i]}`)
    }
  }
}
