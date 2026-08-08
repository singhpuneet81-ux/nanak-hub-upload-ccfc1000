import { useEffect } from "react";

/**
 * Auto-size WordPress iframes like the working pay-calculator embed:
 * full content height, no internal scrollbar, no blank-space inflation.
 *
 * Posts { type: "nanak-embed-resize"|"resize-iframe", height }.
 * Requires /embeds/iframe-parent-resize.js on WordPress (once in footer).
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const isLovablePreview = window.location.hostname.includes("lovable.app");
    if (isLovablePreview) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("iframe-embed");
    body.classList.add("iframe-embed");

    html.style.height = "auto";
    html.style.minHeight = "0";
    html.style.maxHeight = "none";
    html.style.overflow = "hidden";
    html.style.width = "100%";
    body.style.height = "auto";
    body.style.minHeight = "0";
    body.style.maxHeight = "none";
    body.style.overflow = "hidden";
    body.style.width = "100%";

    let lastHeight = 0;
    let stableHits = 0;
    let debounceTimer = 0;
    let stopped = false;

    const contentEl = (): HTMLElement | null => {
      const root = document.getElementById("root");
      if (!root) return null;
      // Prefer the main page wrapper (pricing / calculator), not #root chrome.
      const inner =
        (root.querySelector(".itc") as HTMLElement | null) ||
        (root.firstElementChild as HTMLElement | null) ||
        root;
      return inner;
    };

    const measureHeight = () => {
      const el = contentEl();
      const root = document.getElementById("root");
      if (!el) return 0;

      // Unpin so we measure content, not the current iframe viewport.
      el.style.height = "auto";
      el.style.minHeight = "0";
      el.style.maxHeight = "none";
      if (root) {
        root.style.height = "auto";
        root.style.minHeight = "0";
        root.style.maxHeight = "none";
      }

      // Content box only — never document/body scrollHeight (that caused blank growth).
      const h = Math.max(
        el.scrollHeight || 0,
        el.offsetHeight || 0,
        Math.ceil(el.getBoundingClientRect().height || 0)
      );

      return Math.max(Math.ceil(h) + 20, 120);
    };

    const applySameOrigin = (height: number) => {
      try {
        window.parent.document.querySelectorAll("iframe").forEach((frame) => {
          try {
            if (frame.contentWindow !== window) return;
            const prev = parseFloat(frame.style.height) || 0;
            if (Math.abs(prev - height) < 3) return;
            frame.style.height = `${height}px`;
            frame.style.width = "100%";
            frame.style.maxWidth = "100%";
            frame.style.minHeight = "0";
            frame.style.overflow = "hidden";
            frame.removeAttribute("height");
            frame.setAttribute("scrolling", "no");
            frame.dataset.nanakSized = "1";
          } catch {
            /* other frame */
          }
        });
      } catch {
        /* cross-origin */
      }
    };

    const sendHeight = () => {
      const height = measureHeight();
      if (!Number.isFinite(height) || height < 40) return;

      // Reject absurd inflation jumps (blank-space bug).
      if (lastHeight > 150 && height > lastHeight + 1800) return;
      if (lastHeight > 150 && height > lastHeight * 2.5) return;

      if (Math.abs(height - lastHeight) < 3) {
        stableHits += 1;
        // Stop aggressive settle timers once stable; keep ResizeObserver for async content.
        if (stableHits >= 4 && !stopped) {
          stopped = true;
          window.clearTimeout(debounceTimer);
          timers.forEach((t) => window.clearTimeout(t));
        }
        return;
      }

      // After settle, still allow real content growth (e.g. packages loaded) but not inflation.
      if (stopped) {
        if (height <= lastHeight) return;
        if (height > lastHeight + 1800) return;
      }

      stableHits = 0;
      lastHeight = height;
      applySameOrigin(height);

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

    const scheduleSend = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(sendHeight, 120);
    };

    sendHeight();
    requestAnimationFrame(sendHeight);
    const timers = [150, 400, 900, 1600, 2800].map((ms) =>
      window.setTimeout(sendHeight, ms)
    );

    const root = document.getElementById("root");
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleSend);
      const el = contentEl();
      if (el) ro.observe(el);
      else if (root) ro.observe(root);
    }

    const observer = new MutationObserver(scheduleSend);
    if (root) {
      observer.observe(root, { childList: true, subtree: true, attributes: false });
    }

    window.addEventListener("load", sendHeight);

    return () => {
      stopped = true;
      observer.disconnect();
      ro?.disconnect();
      window.removeEventListener("load", sendHeight);
      window.clearTimeout(debounceTimer);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}
