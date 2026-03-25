/**
 * Tiered pricing config for services with multiple plan tiers
 * (Business Plan, Business Valuation, Business Due Diligence)
 */

export type TieredServiceKey =
  | "business_plan"
  | "business_valuation"
  | "business_due_diligence";

export interface TieredPlan {
  id: string;
  label: string;
  subtitle: string;
  badge: string | null;
  price: number;
  delivery: string;
  recommended: boolean;
  features: string[];
}

export interface TieredAddon {
  id: string;
  label: string;
  price: number;
}

export interface TieredServiceConfig {
  plans: TieredPlan[];
  addons?: TieredAddon[];
}

export const TIERED_PRICING: Record<TieredServiceKey, TieredServiceConfig> = {
  business_plan: {
    plans: [
      {
        id: "startup",
        label: "Startup",
        subtitle: "Pre-launch or just established",
        badge: "Pre-launch / Startup stage",
        price: 990,
        delivery: "5-8 business days delivery",
        recommended: false,
        features: [
          "3-5 year financial projections (P&L, Cash Flow)",
          "Market analysis & competitor research",
          "Executive summary & business overview",
          "Marketing & sales strategy",
          "Professional graphic design",
          "Unlimited revisions (30 days)",
        ],
      },
      {
        id: "growth",
        label: "Growth",
        subtitle: "Established and scaling operations",
        badge: "1-3 years in business",
        price: 1299,
        delivery: "5-8 business days delivery",
        recommended: true,
        features: [
          "3-5 year comprehensive financial projections",
          "In-depth market & competitor analysis",
          "Growth strategy & expansion roadmap",
          "Marketing plan with customer acquisition",
          "Operational & organizational structure",
          "Premium graphic design & formatting",
          "Unlimited revisions (30 days)",
        ],
      },
      {
        id: "established",
        label: "Established",
        subtitle: "Mature business seeking funding",
        badge: "3+ years in business",
        price: 1499,
        delivery: "5-8 business days delivery",
        recommended: false,
        features: [
          "Comprehensive 3-5 year financial projections",
          "Historical performance analysis",
          "Advanced market positioning & strategy",
          "Detailed marketing & growth plan",
          "Risk assessment & mitigation strategies",
          "Management & operations analysis",
          "Premium design + Pitch deck included",
          "Unlimited revisions (30 days)",
        ],
      },
    ],
    addons: [
      { id: "pitch_deck", label: "Investor Pitch Deck", price: 750 },
      { id: "excel_model", label: "Excel Financial Model", price: 500 },
      { id: "pitch_training", label: "Investor Presentation Training", price: 650 },
      { id: "rush_delivery", label: "Rush Delivery (3-4 business days)", price: 500 },
    ],
  },

  business_valuation: {
    plans: [
      {
        id: "appraisal",
        label: "Appraisal Report",
        subtitle: "Estimate of business value for internal use and general purposes",
        badge: null,
        price: 1399,
        delivery: "7-10 business days delivery",
        recommended: false,
        features: [
          "Short-form Business Appraisal Report",
          "Estimate of business value",
          "Industry benchmarking analysis",
          "Pre-release discussion with experts",
          "Business & industry risk assessment",
        ],
      },
      {
        id: "standard",
        label: "Standard Business Valuation",
        subtitle: "Comprehensive report for sale, divorce, disputes, or court proceedings",
        badge: "MOST POPULAR · COURT ACCEPTED",
        price: 3159,
        delivery: "7-10 business days delivery",
        recommended: true,
        features: [
          "Detailed Business Valuation Report",
          "Comprehensive financial statement analysis",
          "Detailed industry & market analysis",
          "Pre-release discussion with experts",
          "Risk analysis & adjustment factors",
          "Court-acceptable documentation",
          "Multiple valuation methodologies",
        ],
      },
    ],
  },

  business_due_diligence: {
    plans: [
      {
        id: "snapshot",
        label: "Financial Snapshot Review",
        subtitle: "Essential Review",
        badge: null,
        price: 500,
        delivery: "3-5 business days",
        recommended: false,
        features: [
          "2 year financial statement analysis",
          "Revenue & profit trend review",
          "Expense and margin analysis",
          "Basic cash flow review",
          "Working capital health check",
          "Industry ratio comparison",
          "Risk flag summary report",
          "30 min strategy call",
        ],
      },
      {
        id: "comprehensive",
        label: "Comprehensive Financial DD",
        subtitle: "Full Analysis & Valuation",
        badge: "RECOMMENDED",
        price: 1500,
        delivery: "5-7 business days",
        recommended: true,
        features: [
          "3-5 year deep financial analysis",
          "Normalised earnings adjustment (EBITDA correction)",
          "Valuation using EBITDA multiple, revenue multiple, DCF",
          "Tax risk exposure analysis",
          "Owner add-backs review",
          "Cash flow sustainability modelling",
          "Break-even sensitivity modelling",
          "Financial risk heat map",
          "Negotiation support insights",
          "Written valuation opinion report",
          "60-min strategic advisory call",
        ],
      },
    ],
  },
};

export const TIERED_DISPLAY_NAMES: Record<TieredServiceKey, string> = {
  business_plan: "Business Plan",
  business_valuation: "Business Valuation",
  business_due_diligence: "Business Due Diligence",
};
