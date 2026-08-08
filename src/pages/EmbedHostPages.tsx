/**
 * Thin host pages so marketing embeds live on online.nanakaccountants.com.au
 * Height hugs content (no min-h-screen) for footer widgets; calculators can grow tall.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const EMBED_BASE = "https://api.connect.cavaluer.com/embeds";

type Props = {
  title: string;
  src: string;
  /** Initial height before embed posts its measured size */
  initialHeight?: number;
  /** Floor height (0 = hug content exactly). */
  minHeight?: number;
  /** Cap growth so a broken embed can't blow up the page */
  maxHeight?: number;
};

export function EmbedHostPage({
  title,
  src,
  initialHeight = 220,
  minHeight = 0,
  maxHeight = 900,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);

  const applyHeight = useCallback(
    (raw: number) => {
      if (!Number.isFinite(raw) || raw <= 0) return;
      const next = Math.min(maxHeight, Math.max(minHeight, Math.ceil(raw)));
      setHeight((prev) => (Math.abs(prev - next) < 2 ? prev : next));
    },
    [maxHeight, minHeight]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "nanak-embed-resize") return;
      const h = Number(data.height);
      applyHeight(h);
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            { type: "nanak-embed-resize", height: h, source: data.source || "embed-host" },
            "*"
          );
        }
      } catch {
        /* ignore */
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
  // Prefer the static embed (no React shell height). Keeps WP footer iframes tight.
  useEffect(() => {
    window.location.replace("/embeds/newsletter.html");
  }, []);
  return null;
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

/** Public pay calculator — static embed (no nested iframe that shrinks layout). */
export function PayCalculatorEmbedPage() {
  useEffect(() => {
    window.location.replace("/embeds/pay-calculator.html");
  }, []);
  return null;
}

/** Blog page sidebar enquiry form — served from this domain's /embeds (not API). */
export function BlogSidebarEmbedPage() {
  return (
    <EmbedHostPage
      title="Blog sidebar enquiry"
      src="/embeds/blog-sidebar.html"
      initialHeight={620}
      maxHeight={900}
    />
  );
}

export default NewsletterEmbedPage;
