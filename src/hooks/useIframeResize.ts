import { useEffect } from "react";

/**
 * Detects if the app is inside an iframe and resizes the parent frame
 * to fit full content (checkout, pricing, calculators, etc.).
 *
 * Cross-origin WordPress parents must listen for:
 *   { type: "nanak-embed-resize"|"resize-iframe", height: number }
 * Use /embeds/iframe-parent-resize.js on the marketing site.
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const isLovablePreview = window.location.hostname.includes("lovable.app");
    if (isLovablePreview) return;

    document.documentElement.classList.add("iframe-embed");
    document.body.classList.add("iframe-embed");

    // Hug content — never force viewport height inside WP iframes.
    document.documentElement.style.height = "auto";
    document.documentElement.style.minHeight = "0";
    document.body.style.height = "auto";
    document.body.style.minHeight = "0";
    // Allow scrolling inside the iframe as a safety net if the parent
    // hasn't applied the posted height yet (avoids half-cut cards).
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    const forwardWheel = (e: WheelEvent) => {
      window.parent.postMessage(
        { type: "iframe-wheel", deltaY: e.deltaY, deltaX: e.deltaX },
        "*"
      );
    };
    window.addEventListener("wheel", forwardWheel, { passive: true });

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - y;
      touchStartY = y;
      window.parent.postMessage({ type: "iframe-wheel", deltaY, deltaX: 0 }, "*");
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let lastHeight = 0;

    const measureHeight = () => {
      const root = document.getElementById("root");
      const candidates = [
        root?.scrollHeight ?? 0,
        root?.offsetHeight ?? 0,
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight,
      ];
      // Prefer content root when present (avoids 100vh inflation).
      const fromRoot = Math.max(root?.scrollHeight ?? 0, root?.offsetHeight ?? 0);
      const raw = fromRoot > 80 ? fromRoot : Math.max(...candidates);
      return Math.ceil(raw) + 16;
    };

    const applySameOrigin = (height: number) => {
      try {
        const frames = window.parent.document.querySelectorAll("iframe");
        frames.forEach((frame) => {
          try {
            if (frame.contentWindow === window) {
              frame.style.height = `${height}px`;
              frame.style.width = "100%";
              frame.style.maxWidth = "100%";
              frame.style.overflow = "visible";
              frame.removeAttribute("height");
              frame.setAttribute("scrolling", "no");
            }
          } catch {
            /* other frame */
          }
        });
        return true;
      } catch {
        return false;
      }
    };

    const sendHeight = () => {
      const height = measureHeight();
      if (!Number.isFinite(height) || height < 40) return;
      if (Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;

      applySameOrigin(height);

      // Always notify parent (WordPress is cross-origin and needs this).
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

    sendHeight();
    requestAnimationFrame(sendHeight);
    const t1 = window.setTimeout(sendHeight, 100);
    const t2 = window.setTimeout(sendHeight, 400);
    const t3 = window.setTimeout(sendHeight, 1000);
    const t4 = window.setTimeout(sendHeight, 2000);

    const observer = new MutationObserver(() => {
      sendHeight();
      requestAnimationFrame(sendHeight);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener("resize", sendHeight);
    const interval = window.setInterval(sendHeight, 500);

    // Same-origin parent bridge (no-op on WordPress cross-origin).
    try {
      const parentDoc = window.parent.document;
      const scriptId = "__iframe_scroll_bridge__";
      if (!parentDoc.getElementById(scriptId)) {
        const script = parentDoc.createElement("script");
        script.id = scriptId;
        script.textContent = `
          window.addEventListener("message", function(e) {
            if (!e.data) return;
            if (e.data.type === "resize-iframe" || e.data.type === "nanak-embed-resize") {
              var h = Number(e.data.height);
              if (!h) return;
              document.querySelectorAll("iframe").forEach(function(f) {
                try { if (f.contentWindow === e.source) { f.style.height = h + "px"; f.removeAttribute("height"); } } catch(_) {}
              });
            }
            if (e.data.type === "iframe-wheel") {
              window.scrollBy({ top: e.data.deltaY, left: e.data.deltaX || 0, behavior: "auto" });
            }
          });
        `;
        parentDoc.head.appendChild(script);
      }
    } catch {
      /* cross-origin — use /embeds/iframe-parent-resize.js on WP */
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sendHeight);
      window.removeEventListener("wheel", forwardWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.clearInterval(interval);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);
}
