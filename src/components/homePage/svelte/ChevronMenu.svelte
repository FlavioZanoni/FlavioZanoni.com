<script lang="ts">
  import { onMount } from "svelte"

  export let id: string

  let left = "0px"
  let bottom = "0px"

  onMount(() => {
    const chevronButton = document.getElementById("chevronButon")

    const chevronButtonRect = chevronButton.getBoundingClientRect()
    left = `${chevronButtonRect.left - 90 + chevronButtonRect.width / 2}px`
    bottom = `${window.innerHeight - chevronButtonRect.bottom + chevronButtonRect.height + 10}px`
  })
</script>

<section {id} style="left: {left}; bottom: {bottom}; " class="absolute">
  <div
    class="flex flex-row gap-3 w-[180px] h-[100px] bg-slate-400 border border-slate-900 p-2"
  >
    <a target="_blank" href="https://www.linkedin.com/in/flaviozanoni/">
      <enhanced:img
        loading="lazy"
        class="w-5"
        src="@assets/linkedin.webp"
        alt="Linkedin"
      />
    </a>
    <a target="_blank" href="https://github.com/FlavioZanoni">
      <enhanced:img
        loading="lazy"
        class="w-5"
        src="@assets/github.webp"
        alt="Github"
      />
    </a>
  </div>
</section>
