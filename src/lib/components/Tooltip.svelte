<script lang="ts">
  import { scale } from "svelte/transition";

  export let text = "";
  // Alap: a gomb ALATT-JOBBRA
  export let placement: "bottom-right" | "top" | "bottom" | "left" | "right" = "bottom-right";
  export let delay = 80;
  // Variánsok: hozzáadva a "lavender" és "peach"
  export let variant: "friendly" | "light" | "dark" | "lavender" | "peach" = "friendly";

  let open = false;
  let openT: ReturnType<typeof setTimeout>;
  let closeT: ReturnType<typeof setTimeout>;

  function show() {
    clearTimeout(closeT);
    openT = setTimeout(() => (open = true), delay);
  }
  function hide() {
    clearTimeout(openT);
    closeT = setTimeout(() => (open = false), delay);
  }

  // Pozicionálás (Tailwind utility-k) – finomabb offset a bottom-right esetén
  $: posCls =
    placement === "bottom-right"
      ? "top-[calc(100%+10px)] left-[calc(100%+10px)] origin-top-left"
      : placement === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 mt-2 origin-top"
      : placement === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom"
      : placement === "left"
      ? "right-full top-1/2 -translate-y-1/2 mr-2 origin-right"
      : /* right */ "left-full top-1/2 -translate-y-1/2 ml-2 origin-left";

  // Doboz stílus variánsok
  $: boxCls =
    variant === "lavender"
      // Lavender: violet → purple → fuchsia
      ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-500 text-white border-white/20 ring-black/30"
    : variant === "peach"
      // Peach: orange → amber → orange
      ? "bg-gradient-to-br from-orange-400 via-amber-500 to-orange-500 text-white border-white/20 ring-black/30"
    : variant === "friendly"
      // Barátságos: kék → cián → teal
      ? "bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 text-white border-white/20 ring-black/30"
    : variant === "light"
      // Világos: fehér alapon sötét szöveg
      ? "bg-white/95 text-slate-900 border-slate-200 ring-black/5"
      // Dark fallback
      : "bg-slate-900 text-slate-50 border-white/10 ring-black/40";

  // Nyíl színe a variánshoz illesztve
  $: arrowBg =
    variant === "lavender" ? "bg-purple-500 border-white/20" :
    variant === "peach"    ? "bg-amber-500 border-white/20"  :
    variant === "friendly" ? "bg-cyan-500 border-white/20"   :
    variant === "light"    ? "bg-white border-slate-200"     :
                             "bg-slate-900 border-white/10";

  // Nyíl pozíció – finomabb eltartás a bottom-right esetén
  $: arrowPos =
    placement === "bottom-right"
      ? "top-0 left-0 -translate-x-1/3 -translate-y-1/3"
      : placement === "bottom"
      ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
      : placement === "top"
      ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
      : placement === "left"
      ? "left-full top-1/2 -translate-y-1/2 -translate-x-1/2"
      : /* right */ "right-full top-1/2 -translate-y-1/2 translate-x-1/2";
</script>

<div
  class="relative inline-block"
  on:mouseenter={show}
  on:mouseleave={hide}
  on:focusin={show}
  on:focusout={hide}
>
  <slot />

  {#if open}
    <div
      class={`absolute z-50 w-64 px-3.5 py-2.5 rounded-2xl shadow-2xl border
              backdrop-blur-md ring-1
              text-[13px] leading-snug whitespace-pre-wrap pointer-events-none
              ${boxCls} ${posCls}`}
      role="tooltip"
      transition:scale={{ duration: 140, start: 0.92 }}
    >
      {text}
      <span class={`absolute w-2.5 h-2.5 rotate-45 border ${arrowBg} ${arrowPos}`}></span>
    </div>
  {/if}
</div>
