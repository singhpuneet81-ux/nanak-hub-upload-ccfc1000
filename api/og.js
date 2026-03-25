export const config = { runtime: 'edge' };

const BOT_USER_AGENTS = [
  "facebookexternalhit", "Facebot", "Twitterbot", "LinkedInBot", "WhatsApp",
  "TelegramBot", "Slackbot", "Discordbot", "Googlebot", "bingbot", "Applebot",
  "Pinterestbot", "redditbot", "Embedly", "Quora Link Preview", "Showyoubot",
  "outbrain", "vkShare", "W3C_Validator", "Iframely",
];

const ROUTE_META = {
  "/charity-setup": { title: "Charity Setup | Nanak Accountants", description: "Set up your Australian charity — Incorporated Association or Company Limited by Guarantee. Expert guidance & ACNC registration support." },
  "/abn-registration": { title: "ABN Registration | Nanak Accountants", description: "Register your Australian Business Number (ABN) quickly and securely. Fast processing by registered tax agents." },
  "/business-name-registration": { title: "Business Name Registration | Nanak Accountants", description: "Register your Australian business name with ASIC. Fast, secure checkout with expert support." },
  "/family-trust-setup": { title: "Family Trust Setup | Nanak Accountants", description: "Establish your family trust with professional trust deed preparation. ATO registered agents." },
  "/unit-trust-setup": { title: "Unit Trust Setup | Nanak Accountants", description: "Set up your unit trust with expert guidance. Professional trust deed and TFN/ABN registration included." },
  "/gst-registration": { title: "GST Registration | Nanak Accountants", description: "Register for GST quickly and securely. Expert support from registered tax agents." },
  "/company-registration": { title: "Company Registration | Nanak Accountants", description: "Register your Australian company with ASIC. Fast processing by registered agents." },
  "/smsf-setup": { title: "SMSF Setup | Nanak Accountants", description: "Set up your Self-Managed Super Fund with expert guidance and ATO compliance." },
  "/partnership-registration": { title: "Partnership Registration | Nanak Accountants", description: "Register your partnership with ABN, TFN and tax setup. Fast and secure." },
  "/bare-trust-setup": { title: "Bare Trust Setup | Nanak Accountants", description: "Establish your bare trust for SMSF property purchases. Professional deed preparation." },
  "/sole-trader-tax-return": { title: "Sole Trader Tax Return | Nanak Accountants", description: "Lodge your sole trader tax return with expert support. Maximise your deductions." },
  "/bundle-tax-return": { title: "Bundle Tax Return | Nanak Accountants", description: "Bundle your tax returns and save. Individual, ABN, and company returns in one place." },
  "/tfn-registration": { title: "TFN Registration | Nanak Accountants", description: "Apply for your Tax File Number (TFN) quickly and securely." },
  "/ndis-business-setup": { title: "NDIS Business Setup | Nanak Accountants", description: "Set up your NDIS provider business with expert compliance guidance." },
  "/dgr-registration": { title: "DGR Registration | Nanak Accountants", description: "Register as a Deductible Gift Recipient. Expert charity and NFP support." },
  "/nfp-accounting": { title: "NFP Accounting | Nanak Accountants", description: "Professional accounting services for not-for-profit organisations. ACNC compliant." },
  "/trust-accounting": { title: "Trust Accounting | Nanak Accountants", description: "Professional trust accounting and compliance services for Australian trusts." },
  "/company-accounting": { title: "Company Accounting | Nanak Accountants", description: "Professional company accounting, BAS, and tax compliance services." },
  "/individual-tax-return": { title: "Individual Tax Return | Nanak Accountants", description: "Lodge your individual tax return online. Maximise deductions with expert tax agents." },
  "/asic-agent-landing": { title: "ASIC Agent Services | Nanak Accountants", description: "Professional ASIC agent services for annual reviews and company compliance." },
  "/asic-agent-services": { title: "ASIC Agent Services | Nanak Accountants", description: "Professional ASIC agent services for annual reviews and company compliance." },
  "/tax-calculator": { title: "Tax Calculator | Nanak Accountants", description: "Calculate your Australian tax obligations. Free online tax calculator." },
  "/stamp-duty-calculator": { title: "Stamp Duty Calculator | Nanak Accountants", description: "Calculate stamp duty for property purchases across Australian states." },
  "/business-valuation": { title: "Business Valuation | Nanak Accountants", description: "Professional business valuation services. Get an accurate value for your business." },
  "/pricing": { title: "Pricing | Nanak Accountants", description: "Transparent pricing for ABN, business name, trust, company registration and accounting services." },
};

const DEFAULT_META = {
  title: "Nanak Accountants | Business & Tax Services",
  description: "ABN, business name, company, trust, charity registration & accounting services. ASIC registered agents with 5,000+ businesses served.",
};

function isBot(userAgent) {
  const ua = (userAgent || "").toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

function getMetaForPath(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  const match = Object.keys(ROUTE_META)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_META[match] : DEFAULT_META;
}

export default async function handler(request) {
  const userAgent = request.headers.get("user-agent") || "";
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only intercept for bots
  if (!isBot(userAgent)) {
    // Serve the SPA index.html for regular users
    const indexUrl = new URL("/index.html", url.origin);
    return fetch(indexUrl);
  }

  const meta = getMetaForPath(pathname);
  const fullUrl = `https://online.nanakaccountants.com.au${pathname}${url.search}`;
  const ogImage = "https://online.nanakaccountants.com.au/favicon.webp";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="Nanak Accountants" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <link rel="icon" type="image/webp" href="/favicon.webp" />
</head>
<body>
  <h1>${meta.title}</h1>
  <p>${meta.description}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
