/**
 * Thin host pages so marketing embeds live on online.nanakaccountants.com.au.
 * Prefer redirecting to static /embeds/*.html so WordPress iframes are
 * single-layer and auto-resize (no nested iframe shrink/clip).
 */
import { useEffect } from "react";

function RedirectEmbed({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

/** Newsletter signup */
export function NewsletterEmbedPage() {
  return <RedirectEmbed to="/embeds/newsletter.html" />;
}

/** Free 15-minute call popup */
export function PopupEmbedPage() {
  return <RedirectEmbed to="/embeds/free-15min-call.html" />;
}

/** Footer tax-check quiz */
export function FooterTaxCheckEmbedPage() {
  return <RedirectEmbed to="/embeds/tax-check.html" />;
}

/** Public pay calculator */
export function PayCalculatorEmbedPage() {
  return <RedirectEmbed to="/embeds/pay-calculator.html" />;
}

/** Public income tax calculator (same static-embed pattern as pay calculator) */
export function IncomeTaxCalculatorEmbedPage() {
  return <RedirectEmbed to="/embeds/income-tax-calculator.html" />;
}

/** Blog page sidebar enquiry */
export function BlogSidebarEmbedPage() {
  return <RedirectEmbed to="/embeds/blog-sidebar.html" />;
}

export default NewsletterEmbedPage;
