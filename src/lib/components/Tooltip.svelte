<script lang="ts">
  export let text = "";
  export let placement: "top" | "bottom" | "left" | "right" = "top";
  let open = false;

  const posCls =
    placement === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : placement === "bottom"
      ? "top-full mt-2 left-1/2 -translate-x-1/2"
      : placement === "left"
      ? "right-full mr-2 top-1/2 -translate-y-1/2"
      : "left-full ml-2 top-1/2 -translate-y-1/2";

  const arrowCls =
    placement === "top"
      ? "top-full left-1/2 -translate-x-1/2"
      : placement === "bottom"
      ? "bottom-full left-1/2 -translate-x-1/2"
      : placement === "left"
      ? "left-full top-1/2 -translate-y-1/2"
      : "right-full top-1/2 -translate-y-1/2";
</script>

<div
  class="relative inline-block"
  on:mouseenter={() => (open = true)}
  on:mouseleave={() => (open = false)}
  on:focusin={() => (open = true)}
  on:focusout={() => (open = false)}
>
  <slot />

  {#if open}
    <div
      class={`absolute z-50 max-w-xs px-3 py-2 rounded-xl shadow-lg bg-gray-900 text-white text-xs leading-snug whitespace-pre-wrap ${posCls}`}
      role="tooltip"
    >
      {text}
      <span class={`absolute w-2 h-2 rotate-45 bg-gray-900 ${arrowCls}`}></span>
    </div>
  {/if}
</div>
