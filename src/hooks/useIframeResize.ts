import { useEffect } from "react";

/**
 * Detects if the app is inside an iframe and handles resizing
 * entirely from the application side — no WordPress code needed.
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const isLovablePreview = window.location.hostname.includes("lovable.app");
    if (isLovablePreview) return;

    // Force the iframe body to never scroll internally — parent owns the scrollbar
    document.documentElement.style.height = "auto";
    document.documentElement.style.minHeight = "0";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "auto";
    document.body.style.minHeight = "0";
    document.body.style.overflow = "hidden";

    // Forward wheel events to parent so scrolling inside iframe scrolls the parent page
    const forwardWheel = (e: WheelEvent) => {
      window.parent.postMessage(
        { type: "iframe-wheel", deltaY: e.deltaY, deltaX: e.deltaX },
        "*"
      );
    };
    window.addEventListener("wheel", forwardWheel, { passive: true });

    // Forward touch scroll to parent
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      window.parent.postMessage(
        { type: "iframe-wheel", deltaY, deltaX: 0 },
        "*"
      );
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Make backgrounds transparent so iframe blends with WordPress
    document.documentElement.classList.add("iframe-embed");
    document.body.classList.add("iframe-embed");

    let lastHeight = 0;

    const sendHeight = () => {
      // Use the larger of scrollHeight and offsetHeight to avoid cropping
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      );

      // Only update if height actually changed (avoids layout thrashing)
      if (height === lastHeight) return;
      lastHeight = height;

      // 1. Try direct parent access (same-origin)
      try {
        const frames = window.parent.document.querySelectorAll("iframe");
        frames.forEach((frame) => {
          try {
            if (frame.contentWindow === window) {
              frame.style.height = height + "px";
              frame.style.overflow = "visible";
              frame.setAttribute("scrolling", "no");
            }
          } catch (_) { /* cross-origin frame */ }
        });
      } catch (_) {
        // 2. Cross-origin fallback — postMessage
        window.parent.postMessage({ type: "resize-iframe", height }, "*");
        window.parent.postMessage({ type: "nanak-embed-resize", height, source: "online-hub" }, "*");
      }
    };

    // Initial + deferred sends to catch late layout shifts
    sendHeight();
    requestAnimationFrame(sendHeight);
    setTimeout(sendHeight, 100);
    setTimeout(sendHeight, 500);

    const observer = new MutationObserver(() => {
      sendHeight();
      // Re-check after DOM settles (animations, lazy content)
      requestAnimationFrame(sendHeight);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener("resize", sendHeight);
    const interval = setInterval(sendHeight, 300);

    // Inject scroll + resize bridge into parent (same-origin only)
    try {
      const parentDoc = window.parent.document;
      const scriptId = "__iframe_scroll_bridge__";
      if (!parentDoc.getElementById(scriptId)) {
        const script = parentDoc.createElement("script");
        script.id = scriptId;
        script.textContent = `
          window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "resize-iframe") {
              var iframes = document.querySelectorAll("iframe");
              iframes.forEach(function(f) {
                try { if (f.contentWindow === e.source) f.style.height = e.data.height + "px"; } catch(_) {}
              });
            }
            if (e.data && e.data.type === "iframe-wheel") {
              window.scrollBy({ top: e.data.deltaY, left: e.data.deltaX, behavior: "auto" });
            }
          });
        `;
        parentDoc.head.appendChild(script);
      }
    } catch (_) { /* cross-origin */ }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sendHeight);
      window.removeEventListener("wheel", forwardWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      clearInterval(interval);
    };
  }, []);
}
