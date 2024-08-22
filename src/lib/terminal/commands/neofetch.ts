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
  }

  const loopSize = Math.max(Object.keys(info).length, splitted.length)

  term.writeln("")
  for (let i = 0; i < loopSize; i++) {
    if (i < splitted.length) {
      const imageLine = splitted[i]
      const targetColumn = imageWidth + 2
      const moveCursor = `\x1b[${targetColumn}G`;

      if (!Object.keys(info)[i]) {
        term.writeln(`${imageLine}${moveCursor}`)
        continue
      } else {
        term.writeln(`${imageLine}${moveCursor} \x1b[38;2;95;205;228m${Object.keys(info)[i]}: \x1b[37m${Object.values(info)[i]}`);
      }
    } else {
      if (!Object.keys(info)[i]) continue
      term.writeln(`${" ".padEnd(imageWidth, " ")}  ${Object.keys(info)[i]}: ${Object.values(info)[i]}`)
    }
  }
}
