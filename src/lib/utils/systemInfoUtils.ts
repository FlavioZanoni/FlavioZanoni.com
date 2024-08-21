import pkgJson from "../../../package.json"

export type SystemInfo = {
  os: string
  osVersion: string
  memory: number
  cores: number
  browser: string
  language: string
  platform: string
}

export const getSystemInfo = (): SystemInfo => {
  const info = {
    os: "FZ-OS",
    osVersion: pkgJson.version,
    memory: navigator.deviceMemory,
    cores: navigator.hardwareConcurrency,
    browser: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
  }
  return info
}

export type ScreenInfo = {
  width: number
  height: number
  colorDepth: number
  pixelDepth: number
}
export const getScreenInfo = (): ScreenInfo => {
  const info = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  }
  return info
}

export type NetworkInfo = {
  online: boolean
}
export const getNetworkInfo = (): NetworkInfo => {
  const info = {
    online: navigator.onLine,
  }
  return info
}

export type StorageInfo = {
  quota: number
  usage: number
}
export const getStorageInfo = async (): Promise<StorageInfo> => {
  const { quota, usage } = await navigator.storage.estimate()
  const info = {
    quota: quota / 1024 / 1024,
    usage: !usage ? 0 : usage / 1024 / 1024
  }
  return info
}

export type MediaDevicesInfo = {
  devices: MediaDeviceInfo[]
}
export const getMediaDevicesInfo = async (): Promise<MediaDevicesInfo> => {
  const devices = await navigator.mediaDevices.enumerateDevices()

  return { devices }
}
