import { useEffect } from "react";

/**
 * Size WordPress iframes to FULL content height so the WP page scrolls normally
 * (no half-cut content, no inner iframe scrollbar).
 *
 * Requires footer once:
 *   <script src="https://online.nanakaccountants.com.au/embeds/iframe-parent-resize.js" defer></script>
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;
    if (window.location.hostname.includes("lovable.app")) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("iframe-embed");
    body.classList.add("iframe-embed");

    html.style.cssText += ";height:auto!important;min-height:0!important;max-height:none!important;overflow:hidden!important;width:100%!important";
    body.style.cssText += ";height:auto!important;min-height:0!important;max-height:none!important;overflow:hidden!important;width:100%!important";

    let lastHeight = 0;
    let debounceTimer = 0;

    const contentEl = (): HTMLElement | null => {
      const root = document.getElementById("root");
      if (!root) return null;
      return (
        (root.querySelector(".itc") as HTMLElement | null) ||
        (root.querySelector("[class*='min-h-screen']") as HTMLElement | null) ||
        (root.firstElementChild as HTMLElement | null) ||
        root
      );
    };

    /** Full content height — not the short iframe viewport. */
    const measureHeight = () => {
      const root = document.getElementById("root");
      const el = contentEl();
      if (!root || !el) return 0;

      root.style.setProperty("height", "auto", "important");
      root.style.setProperty("min-height", "0", "important");
      root.style.setProperty("max-height", "none", "important");
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("max-height", "none", "important");

      // Walk direct children with offsetTop (immune to iframe clip).
      let fromKids = 0;
      const kids = el.children;
      for (let i = 0; i < kids.length; i++) {
        const child = kids[i] as HTMLElement;
        fromKids = Math.max(fromKids, child.offsetTop + child.offsetHeight);
      }

      const h = Math.max(
        fromKids,
        el.scrollHeight || 0,
        el.offsetHeight || 0,
        root.scrollHeight || 0
      );

      return Math.min(Math.max(Math.ceil(h) + 24, 120), 10000);
    };

    const post = (height: number) => {
      try {
        window.parent.postMessage({ type: "resize-iframe", height }, "*");
        window.parent.postMessage(
          { type: "nanak-embed-resize", height, source: "online-hub" },
          "*"
        );
      } catch {
        /* ignore */
      }
    };

    const sendHeight = () => {
      const height = measureHeight();
      if (!Number.isFinite(height) || height < 40) return;
      if (Math.abs(height - lastHeight) < 4) return;
      lastHeight = height;
      post(height);
    };

    const scheduleSend = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(sendHeight, 100);
    };

    sendHeight();
    requestAnimationFrame(sendHeight);
    const timers = [100, 300, 700, 1200, 2000, 3500, 5000, 8000].map((ms) =>
      window.setTimeout(sendHeight, ms)
    );

    const root = document.getElementById("root");
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleSend);
      const el = contentEl();
      if (el) ro.observe(el);
      if (root && root !== el) ro.observe(root);
    }

    const observer = new MutationObserver(scheduleSend);
    if (root) {
      observer.observe(root, { childList: true, subtree: true, attributes: false });
    }

    window.addEventListener("load", sendHeight);

    return () => {
      observer.disconnect();
      ro?.disconnect();
      window.removeEventListener("load", sendHeight);
      window.clearTimeout(debounceTimer);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}
