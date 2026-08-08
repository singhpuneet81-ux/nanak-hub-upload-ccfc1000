import { useEffect } from "react";

/**
 * Auto-size WordPress iframes to FULL content height.
 *
 * WP iframes often have no height + scrolling="no". Measuring #root while the
 * iframe is short returns the viewport height (half-cut cards). We use the
 * classic 1px scrollHeight trick so height always reflects real content.
 *
 * No wheel hijacking. Grows freely; shrinks only on large content changes.
 */
export function useIframeResize() {
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const isLovablePreview = window.location.hostname.includes("lovable.app");
    if (isLovablePreview) return;

    document.documentElement.classList.add("iframe-embed");
    document.body.classList.add("iframe-embed");

    const html = document.documentElement;
    const body = document.body;
    html.style.width = "100%";
    html.style.overflow = "visible";
    html.style.maxHeight = "none";
    body.style.width = "100%";
    body.style.overflow = "visible";
    body.style.maxHeight = "none";

    let lastHeight = 0;
    let debounceTimer = 0;

    const measureHeight = () => {
      const root = document.getElementById("root");

      // Unpin heights so scrollHeight reflects content, not the short iframe box.
      const prevHtmlH = html.style.height;
      const prevBodyH = body.style.height;
      const prevRootH = root?.style.height ?? "";
      html.style.height = "auto";
      html.style.minHeight = "0";
      body.style.height = "1px";
      body.style.minHeight = "0";
      if (root) {
        root.style.height = "auto";
        root.style.minHeight = "0";
      }

      let contentBottom = 0;
      if (root) {
        const rootTop = root.getBoundingClientRect().top + window.scrollY;
        const nodes = root.querySelectorAll("*");
        nodes.forEach((node) => {
          const el = node as HTMLElement;
          if (!el.getBoundingClientRect) return;
          const r = el.getBoundingClientRect();
          if (r.width < 1 && r.height < 1) return;
          contentBottom = Math.max(contentBottom, r.bottom + window.scrollY - rootTop);
        });
        contentBottom = Math.max(
          contentBottom,
          root.scrollHeight,
          root.offsetHeight,
          root.getBoundingClientRect().height
        );
      }

      const bodyScroll = Math.max(body.scrollHeight, body.offsetHeight);
      const raw = Math.max(contentBottom, bodyScroll);

      body.style.height = prevBodyH;
      html.style.height = prevHtmlH;
      if (root) root.style.height = prevRootH;

      return Math.max(Math.ceil(raw) + 24, 200);
    };

    const applySameOrigin = (height: number) => {
      try {
        const frames = window.parent.document.querySelectorAll("iframe");
        frames.forEach((frame) => {
          try {
            if (frame.contentWindow === window) {
              const prev = parseFloat(frame.style.height) || 0;
              if (Math.abs(prev - height) < 2) return;
              frame.style.height = `${height}px`;
              frame.style.width = "100%";
              frame.style.maxWidth = "100%";
              frame.style.minHeight = "0";
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

      // Always grow to full content; only shrink if content dropped a lot (step change).
      if (height < lastHeight) {
        if (lastHeight - height < 80) return;
      } else if (Math.abs(height - lastHeight) < 2) {
        return;
      }
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
      debounceTimer = window.setTimeout(sendHeight, 60);
    };

    sendHeight();
    requestAnimationFrame(sendHeight);
    const timers = [100, 300, 600, 1200, 2000, 3500, 5000].map((ms) =>
      window.setTimeout(sendHeight, ms)
    );

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
    window.addEventListener("load", sendHeight);

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
                    if (h > prev || Math.abs(prev - h) >= 2) {
                      f.style.height = h + "px";
                      f.style.width = "100%";
                      f.style.minHeight = "0";
                      f.style.overflow = "hidden";
                      f.removeAttribute("height");
                      f.setAttribute("scrolling", "no");
                    }
                  }
                } catch(_) {}
              });
            }
          });
        `;
        parentDoc.head.appendChild(script);
      }
    } catch {
      /* cross-origin WP — needs iframe-parent-resize.js */
    }

    return () => {
      observer.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", scheduleSend);
      window.removeEventListener("load", sendHeight);
      window.clearTimeout(debounceTimer);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}
