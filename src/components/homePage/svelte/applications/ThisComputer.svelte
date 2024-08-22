<script lang="ts">
  import {
    getSystemInfo,
    getNetworkInfo,
    getStorageInfo,
    getScreenInfo,
    getMediaDevicesInfo,
    type StorageInfo,
    type MediaDevicesInfo,
    type SystemInfo,
  } from "@lib/utils/systemInfoUtils"
  import Background from "./Background.svelte"
  import OSState from "./OSState.svelte"

  let tab = "default"

  const components = {
    Background: Background,
    "OS State": OSState,
  }

  let storageInfo: StorageInfo | undefined
  let devicesInfo: MediaDevicesInfo | undefined
  let sysInfo: SystemInfo | undefined
  const networkInfo = getNetworkInfo()
  const screenInfo = getScreenInfo()

  $: {
    getStorageInfo().then((info) => {
      storageInfo = info
    })
    getMediaDevicesInfo().then((info) => {
      devicesInfo = info
    })
    getSystemInfo().then((info) => {
      sysInfo = info
    })
  }
</script>

<main class="flex w-full h-full">
  <div class="w-1/3 max-w-56 h-full flex flex-col gap-2 p-2 overflow-y-auto">
    <h2>Browse settings:</h2>
    <hr />
    <ul>
      <button class="w-full flex" on:click={() => (tab = "default")}>
        This Computer
      </button>
      <hr />
      {#each Object.keys(components) as component}
        <button class="w-full flex" on:click={() => (tab = component)}>
          {component}
        </button>
        <hr />
      {/each}
    </ul>
  </div>

  <div class="w-full h-full border-l border-l-gray-900 overflow-y-auto">
    {#if tab !== "default"}
      <svelte:component this={components[tab]} />
    {:else}
      <div class="gap-2 flex flex-col max-w-[1032px] p-4">
        <h1 class="text-2xl font-bold">This Computer</h1>
        <p>Here you can see the details of this computer:</p>

        <hr />
        <div>
          <h2>System Info:</h2>
          <div class="ml-3">
            <div class="flex justify-between">
              <p>OS:</p>
              <p>{sysInfo?.os} - {sysInfo?.osVersion}</p>
            </div>
            <div class="flex justify-between">
              <p>Memory:</p>
              <p>{sysInfo?.memory} GB</p>
            </div>
            <div class="flex justify-between">
              <p>CPU:</p>
              <p>{sysInfo?.cores} Cores</p>
            </div>
            <div class="flex justify-between">
              <p>Platform:</p>
              <p>{sysInfo?.platform}</p>
            </div>
            <div>
              <p>Battery:</p>
              {#if sysInfo?.battery?.level}
                <div class="ml-3">
                  <div class="flex justify-between">
                    <p>Level:</p>
                    <p>{sysInfo?.battery?.level * 100}%</p>
                  </div>
                  <div class="flex justify-between">
                    <p>Charging:</p>
                    <p>{sysInfo?.battery?.charging ? "Yes" : "No"}</p>
                  </div>
                </div>
              {:else}
                <p>N/A</p>
              {/if}
            </div>
            <div class="flex justify-between">
              <p>Language:</p>
              <p>{sysInfo?.language}</p>
            </div>
            <div class="flex justify-between gap-1">
              <p>Browser:</p>
              <p>{sysInfo?.browser}</p>
            </div>
          </div>
        </div>

        <hr />
        <div>
          <h2>Storage:</h2>
          <div class="ml-3">
            <div class="flex gap-1 items-center text-sm">
              {#if !storageInfo}
                <p>Loading...</p>
              {:else}
                <span>{storageInfo?.usage || 5}MB</span>
                <progress
                  class="h-5 min-w-60"
                  value={storageInfo?.usage || 5}
                  max={storageInfo?.quota}
                ></progress>
                <span>{storageInfo?.quota}MB</span>
              {/if}
            </div>
          </div>
        </div>

        <hr />
        <div>
          <h2>Screen Info:</h2>
          <div class="ml-3">
            <div class="flex justify-between">
              <p>Resolution:</p>
              <p>{screenInfo.width}x{screenInfo.height}</p>
            </div>
            <div class="flex justify-between">
              <p>Color Depth:</p>
              <p>{screenInfo.colorDepth} bit</p>
            </div>
            <div class="flex justify-between">
              <p>Pixel Depth:</p>
              <p>{screenInfo.pixelDepth} bit</p>
            </div>
          </div>
        </div>

        <hr />
        <div>
          <h2>Network Info:</h2>
          <div class="ml-3">
            <div class="flex justify-between">
              <p>Is connected:</p>
              <p>{networkInfo.online}</p>
            </div>
          </div>
        </div>

        <hr />
        <div>
          <h2>Media Devices:</h2>
          <div class="ml-3">
            <div class="flex flex-col gap-2">
              {#if !devicesInfo?.devices?.length}
                <p>No devices found</p>
              {:else}
                {#each devicesInfo.devices as device}
                  <div class="flex justify-between">
                    <p>{device.kind}</p>
                    <p>{device.label || "unknown"}</p>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>
