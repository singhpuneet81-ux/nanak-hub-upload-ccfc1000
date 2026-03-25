import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
}

const ROUTE_META: Record<string, PageMeta> = {
  "/charity-setup": {
    title: "Charity Setup | Nanak Accountants",
    description: "Set up your Australian charity — Incorporated Association or Company Limited by Guarantee. Expert guidance & ACNC registration support.",
  },
  "/abn-registration": {
    title: "ABN Registration | Nanak Accountants",
    description: "Register your Australian Business Number (ABN) quickly and securely. Fast processing by registered tax agents.",
  },
  "/business-name-registration": {
    title: "Business Name Registration | Nanak Accountants",
    description: "Register your Australian business name with ASIC. Fast, secure checkout with expert support.",
  },
  "/family-trust-setup": {
    title: "Family Trust Setup | Nanak Accountants",
    description: "Establish your family trust with professional trust deed preparation. ATO registered agents.",
  },
  "/unit-trust-setup": {
    title: "Unit Trust Setup | Nanak Accountants",
    description: "Set up your unit trust with expert guidance. Professional trust deed and TFN/ABN registration included.",
  },
  "/gst-registration": {
    title: "GST Registration | Nanak Accountants",
    description: "Register for GST quickly and securely. Expert support from registered tax agents.",
  },
  "/company-registration": {
    title: "Company Registration | Nanak Accountants",
    description: "Register your Australian company with ASIC. Fast processing by registered agents.",
  },
  "/smsf-setup": {
    title: "SMSF Setup | Nanak Accountants",
    description: "Set up your Self-Managed Super Fund with expert guidance and ATO compliance.",
  },
  "/partnership-registration": {
    title: "Partnership Registration | Nanak Accountants",
    description: "Register your partnership with ABN, TFN and tax setup. Fast and secure.",
  },
  "/bare-trust-setup": {
    title: "Bare Trust Setup | Nanak Accountants",
    description: "Establish your bare trust for SMSF property purchases. Professional deed preparation.",
  },
  "/sole-trader-tax-return": {
    title: "Sole Trader Tax Return | Nanak Accountants",
    description: "Lodge your sole trader tax return with expert support. Maximise your deductions.",
  },
  "/bundle-tax-return": {
    title: "Bundle Tax Return | Nanak Accountants",
    description: "Bundle your tax returns and save. Individual, ABN, and company returns in one place.",
  },
  "/tfn-registration": {
    title: "TFN Registration | Nanak Accountants",
    description: "Apply for your Tax File Number (TFN) quickly and securely.",
  },
  "/ndis-business-setup": {
    title: "NDIS Business Setup | Nanak Accountants",
    description: "Set up your NDIS provider business with expert compliance guidance.",
  },
  "/dgr-registration": {
    title: "DGR Registration | Nanak Accountants",
    description: "Register as a Deductible Gift Recipient. Expert charity and NFP support.",
  },
  "/nfp-accounting": {
    title: "NFP Accounting | Nanak Accountants",
    description: "Professional accounting services for not-for-profit organisations. ACNC compliant.",
  },
  "/trust-accounting": {
    title: "Trust Accounting | Nanak Accountants",
    description: "Professional trust accounting and compliance services for Australian trusts.",
  },
  "/company-accounting": {
    title: "Company Accounting | Nanak Accountants",
    description: "Professional company accounting, BAS, and tax compliance services.",
  },
  "/individual-tax-return": {
    title: "Individual Tax Return | Nanak Accountants",
    description: "Lodge your individual tax return online. Maximise deductions with expert tax agents.",
  },
  "/asic-agent-landing": {
    title: "ASIC Agent Services | Nanak Accountants",
    description: "Professional ASIC agent services for annual reviews and company compliance.",
  },
};

function setMetaTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta() {
  const pathname = window.location.pathname;

  useEffect(() => {
    // Match the longest prefix
    const match = Object.keys(ROUTE_META)
      .filter((route) => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];

    if (match) {
      const meta = ROUTE_META[match];
      document.title = meta.title;
      setMetaTag("og:title", meta.title);
      setMetaTag("og:description", meta.description);
    }

    return () => {
      // Reset to defaults on unmount
      document.title = "Nanak Accountants | Business Registration & Accounting Services";
      setMetaTag("og:title", "Nanak Accountants | Business & Tax Services");
      setMetaTag("og:description", "ABN, business name, company, trust, charity registration & accounting services. ASIC registered agents with 5,000+ businesses served.");
    };
  }, [pathname]);
}
