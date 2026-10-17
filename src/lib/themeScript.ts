// Server-safe module (no "use client") so the root layout can inline the boot script.
export const THEME_KEY = "sarke-theme";
export const MOTION_KEY = "sarke-motion";

/**
 * Runs inline in <head> before first paint: applies the saved theme and motion preference
 * (falling back to the OS settings) and marks JS as available. Kept as a string so it can be inlined by the root layout.
 */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');var t;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t;var m;try{m=localStorage.getItem('${MOTION_KEY}')}catch(e){}if(m!=='full'&&m!=='reduced'){m=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'}d.dataset.motion=m})();`;
