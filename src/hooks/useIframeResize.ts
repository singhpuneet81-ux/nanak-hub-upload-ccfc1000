import { useEffect } from "react";

/**
 * When the app is inside an iframe (e.g. WordPress), show like a normal page:
 * full width, hug content, scroll inside the iframe.
 * Does NOT post height to the parent (no WP access / avoids blank-space jumps).
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
  }, []);
}
