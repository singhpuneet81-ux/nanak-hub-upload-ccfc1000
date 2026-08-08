/**
 * Nanak iframe parent resize bridge — add once on nanakaccountants.com.au
 * (WordPress / Elementor → Custom Code / footer scripts).
 *
 *   <script src="https://online.nanakaccountants.com.au/embeds/iframe-parent-resize.js" defer></script>
 *
 * Then for embeds, omit a fixed height (or use a small starter height):
 *   <iframe src="https://online.nanakaccountants.com.au/pricing?service=abn"
 *           style="width:100%;border:0;min-height:400px" scrolling="no"></iframe>
 */
(function () {
  if (window.__nanakIframeParentResize) return;
  window.__nanakIframeParentResize = true;

  function apply(source, height) {
    var h = Number(height);
    if (!h || h < 40) return;
    document.querySelectorAll("iframe").forEach(function (frame) {
      try {
        if (frame.contentWindow === source) {
          frame.style.height = h + "px";
          frame.style.width = "100%";
          frame.style.maxWidth = "100%";
          frame.style.overflow = "visible";
          frame.removeAttribute("height");
          frame.setAttribute("scrolling", "no");
        }
      } catch (_) {}
    });
  }

  window.addEventListener("message", function (e) {
    var data = e && e.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "nanak-embed-resize" || data.type === "resize-iframe") {
      apply(e.source, data.height);
    }
    if (data.type === "iframe-wheel" && typeof data.deltaY === "number") {
      window.scrollBy({ top: data.deltaY, left: data.deltaX || 0, behavior: "auto" });
    }
  });
})();
