/**
 * Thin host pages so marketing embeds live on online.nanakaccountants.com.au
 * the same way /blog does — full-bleed iframe of the API embed.
 *
 * Height must hug content (no min-h-screen) so WordPress/Elementor footers
 * don't stretch to full viewport when iframe-ing /newsletter etc.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const EMBED_BASE = "https://api.connect.cavaluer.com/embeds";

type Props = {
  title: string;
  src: string;
  /** Initial height before embed posts its measured size */
  initialHeight?: number;
  /** Cap growth so a broken embed can't blow up the page */
  maxHeight?: number;
};

export function EmbedHostPage({
  title,
  src,
  initialHeight = 220,
  maxHeight = 900,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);

  const applyHeight = useCallback(
    (raw: number) => {
      if (!Number.isFinite(raw) || raw <= 0) return;
      const next = Math.min(maxHeight, Math.max(120, Math.ceil(raw)));
      setHeight((prev) => (Math.abs(prev - next) < 2 ? prev : next));
    },
    [maxHeight]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      // Embeds post { type: 'nanak-embed-resize', height: number, source?: string }
      if (data.type !== "nanak-embed-resize") return;
      const h = Number(data.height);
      applyHeight(h);
      // Bubble to WordPress/Elementor parent so outer iframe can shrink too
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            { type: "nanak-embed-resize", height: h, source: data.source || "embed-host" },
            "*"
          );
        }
      } catch {
        /* ignore cross-origin */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [applyHeight]);

  return (
    <div className="w-full bg-transparent" style={{ height, overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        title={title}
        src={src}
        className="block w-full border-0"
        style={{ height: "100%", width: "100%" }}
        allow="clipboard-write"
        loading="eager"
        scrolling="no"
      />
    </div>
  );
}

export function NewsletterEmbedPage() {
  return (
    <EmbedHostPage
      title="Newsletter signup"
      src={`${EMBED_BASE}/newsletter.html`}
      initialHeight={200}
      maxHeight={360}
    />
  );
}

export function PopupEmbedPage() {
  return (
    <EmbedHostPage
      title="Free 15-minute call"
      src={`${EMBED_BASE}/free-15min-call.html`}
      initialHeight={640}
      maxHeight={900}
    />
  );
}

/** Footer tax-check quiz widget */
export function FooterTaxCheckEmbedPage() {
  return (
    <EmbedHostPage
      title="Tax check"
      src={`${EMBED_BASE}/tax-check.html`}
      initialHeight={420}
      maxHeight={700}
    />
  );
}

export default NewsletterEmbedPage;
