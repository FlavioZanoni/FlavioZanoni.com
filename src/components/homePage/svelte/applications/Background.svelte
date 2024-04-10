<script lang="ts">
  import { desktopStore } from "@lib/store"

  // You can handle the logic here

  const handleColor = (color: string) => {
    console.log("Color clicked", color)

    desktopStore.update((state) => {
      state.background.color = color
      state.background.base64 = null
      state.background.fileName = null
      return state
    })
  }

  const handleDefaultImages = (fileName: string) => {
    desktopStore.update((state) => {
      state.background.color = null
      state.background.base64 = null
      state.background.fileName = fileName
      return state
    })
  }

  const handleCustomImage = (e: Event) => {
    const file = (e.target as HTMLInputElement).files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result as string

      desktopStore.update((state) => {
        state.background.color = null
        state.background.base64 = base64
        state.background.fileName = null

        state.background.userImages.push({
          base64,
          fileName: file.name,
        })
        return state
      })
    }

    reader.readAsDataURL(file)
  }

  const handleInMemoryImage = (base64: string) => {
    desktopStore.update((state) => {
      state.background.color = null
      state.background.base64 = base64
      state.background.fileName = null
      return state
    })
  }
</script>

<div class="flex flex-col gap-4 p-4 w-full h-full overflow-y-scroll">
  <h1 class="text-2xl font-bold">Choose a background</h1>

  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-mediumw-full">Solid colors</h2>
      <div class="flex flex-wrap gap-4">
        <button
          on:click={() => handleColor("#ef4444")}
          class="w-8 h-8 bg-red-500"
        ></button>
        <button
          on:click={() => handleColor("#22c55e")}
          class="w-8 h-8 bg-green-500"
        ></button>
        <button
          on:click={() => handleColor("#3b82f6")}
          class="w-8 h-8 bg-blue-500"
        ></button>
        <button
          on:click={() => handleColor("#eab308")}
          class="w-8 h-8 bg-yellow-500"
        ></button>
        <button
          on:click={() => handleColor("#ec4899")}
          class="w-8 h-8 bg-pink-500"
        ></button>
        <button
          on:click={() => handleColor("#a855f7")}
          class="w-8 h-8 bg-purple-500"
        ></button>
        <button
          on:click={() => handleColor("#6366f1")}
          class="w-8 h-8 bg-indigo-500"
        ></button>
        <button
          on:click={() => handleColor("#06b6d4")}
          class="w-8 h-8 bg-cyan-500"
        ></button>
        <button
          on:click={() => handleColor("#6b7280")}
          class="w-8 h-8 bg-gray-500"
        ></button>
        <button
          on:click={() => handleColor("#64748b")}
          class="w-8 h-8 bg-slate-500"
        ></button>
        <button
          on:click={() => handleColor("#ffffff")}
          class="w-8 h-8 border border-slate-200 bg-white"
        ></button>
        <button on:click={() => handleColor("#000000")} class="w-8 h-8 bg-black"
        ></button>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-medium">Images</h2>
      <div class="flex flex-wrap gap-4">
        <button on:click={() => handleDefaultImages("xp.jpg")}>
          <img
            src="backgrounds/xp.jpg"
            class="w-24 h-24 bg-cover bg-center"
            alt="win xp background"
          />
        </button>
        <button>
          <img class="w-24 h-24 bg-cover bg-center" />
        </button>
        <button>
          <img class="w-24 h-24 bg-cover bg-center" />
        </button>
      </div>
    </div>

    <div class="flex min-w-full items-end gap-2">
      <hr class="w-1/2 border border-slate-600" />
      <span class="text-lg leading-none">or</span>
      <hr class="w-1/2 border border-slate-600" />
    </div>

    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Upload a custom image</h2>
      <input
        on:change={handleCustomImage}
        type="file"
        accept="image/*"
        class="mt-2"
      />
    </div>

    <div>
      {#if $desktopStore.background.userImages.length > 0}
        <div class="flex flex-col gap-2">
          <h2 class="text-xl font-medium">Your images</h2>
          <div class="flex flex-wrap gap-4">
            {#each $desktopStore.background.userImages as image}
              <button on:click={() => handleInMemoryImage(image.base64)}>
                <img
                  src={image.base64}
                  class="w-24 h-24 bg-cover bg-center"
                  alt={image.fileName}
                />
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
