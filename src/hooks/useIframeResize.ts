import { useEffect } from "react";

/**
 * When framed (WordPress etc.): hug content and post height to parent.
 * Content-root measure only — no document scrollHeight inflation, no wheel hijack.
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const isLovablePreview = window.location.hostname.includes("lovable.app");
    if (isLovablePreview) return;

    document.documentElement.classList.add("iframe-embed");
    document.body.classList.add("iframe-embed");

    document.documentElement.style.height = "auto";
    document.documentElement.style.minHeight = "0";
    document.documentElement.style.width = "100%";
    document.documentElement.style.overflow = "auto";
    document.body.style.height = "auto";
    document.body.style.minHeight = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "auto";

    let lastHeight = 0;
    let debounceTimer = 0;

    const measureHeight = () => {
      const root = document.getElementById("root");
      if (!root) return 0;
      const raw = Math.max(
        root.getBoundingClientRect().height || 0,
        root.offsetHeight || 0,
        root.scrollHeight || 0
      );
      return Math.ceil(raw) + 8;
    };

    const applySameOrigin = (height: number) => {
      try {
        const frames = window.parent.document.querySelectorAll("iframe");
        frames.forEach((frame) => {
          try {
            if (frame.contentWindow === window) {
              const prev = parseFloat(frame.style.height) || 0;
              if (Math.abs(prev - height) < 4) return;
              frame.style.height = `${height}px`;
              frame.style.width = "100%";
              frame.style.maxWidth = "100%";
              frame.style.minHeight = "0";
              frame.style.display = "block";
              frame.style.overflow = "hidden";
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
      if (Math.abs(height - lastHeight) < 4) return;
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
      debounceTimer = window.setTimeout(sendHeight, 50);
    };

    sendHeight();
    requestAnimationFrame(sendHeight);
    const t1 = window.setTimeout(sendHeight, 100);
    const t2 = window.setTimeout(sendHeight, 400);
    const t3 = window.setTimeout(sendHeight, 1000);
    const t4 = window.setTimeout(sendHeight, 2000);

    const root = document.getElementById("root");
    let ro: ResizeObserver | null = null;
    if (root && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleSend);
      ro.observe(root);
    }

    const observer = new MutationObserver(scheduleSend);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    window.addEventListener("resize", scheduleSend);

    try {
      const parentDoc = window.parent.document;
      const scriptId = "__nanak_iframe_resize_bridge__";
      if (!parentDoc.getElementById(scriptId)) {
        const script = parentDoc.createElement("script");
        script.id = scriptId;
        script.textContent = `
          window.addEventListener("message", function(e) {
            if (!e.data) return;
            if (e.data.type === "resize-iframe" || e.data.type === "nanak-embed-resize") {
              var h = Number(e.data.height);
              if (!h || h < 40) return;
              document.querySelectorAll("iframe").forEach(function(f) {
                try {
                  if (f.contentWindow === e.source) {
                    var prev = parseFloat(f.style.height) || 0;
                    if (Math.abs(prev - h) < 4) return;
                    f.style.height = h + "px";
                    f.style.width = "100%";
                    f.style.minHeight = "0";
                    f.style.display = "block";
                    f.style.overflow = "hidden";
                    f.removeAttribute("height");
                    f.setAttribute("scrolling", "no");
                  }
                } catch(_) {}
              });
            }
          });
        `;
        parentDoc.head.appendChild(script);
      }
    } catch {
      /* cross-origin */
    }

    return () => {
      observer.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", scheduleSend);
      window.clearTimeout(debounceTimer);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);
}
