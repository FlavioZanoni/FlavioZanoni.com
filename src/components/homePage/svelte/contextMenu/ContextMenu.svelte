<script lang="ts">
  export let x: number = 0
  export let y: number = 0
</script>

<div
  class="bg-slate-200 border-2 border-slate-900 absolute flex flex-col w-[250px] h-fit divide-y-2 divide-slate-900"
  style={`left: ${x}px; top: ${y}px;`}
>
  <slot />
</div>
