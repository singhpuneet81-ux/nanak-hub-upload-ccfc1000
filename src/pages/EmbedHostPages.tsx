/**
 * Thin host pages so marketing embeds live on online.nanakaccountants.com.au
 * the same way /blog does — full-bleed iframe of the API embed.
 */
const EMBED_BASE = "https://api.connect.cavaluer.com/embeds";

type Props = {
  title: string;
  src: string;
  minHeight?: number;
};

export function EmbedHostPage({ title, src, minHeight = 640 }: Props) {
  return (
    <div className="min-h-screen w-full bg-background">
      <iframe
        title={title}
        src={src}
        className="block w-full border-0"
        style={{ minHeight }}
        allow="clipboard-write"
        loading="eager"
      />
    </div>
  );
}

export function NewsletterEmbedPage() {
  return (
    <EmbedHostPage
      title="Newsletter signup"
      src={`${EMBED_BASE}/newsletter.html`}
      minHeight={280}
    />
  );
}

export function PopupEmbedPage() {
  return (
    <EmbedHostPage
      title="Free 15-minute call"
      src={`${EMBED_BASE}/free-15min-call.html`}
      minHeight={720}
    />
  );
}

/** Footer tax-check quiz widget */
export function FooterTaxCheckEmbedPage() {
  return (
    <EmbedHostPage
      title="Tax check"
      src={`${EMBED_BASE}/tax-check.html`}
      minHeight={520}
    />
  );
}

export default NewsletterEmbedPage;
