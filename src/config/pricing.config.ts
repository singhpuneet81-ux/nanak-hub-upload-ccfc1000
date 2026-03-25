export type PricingServiceKey =
  | "abn"
  | "business_name"
  | "family_trust"
  | "gst"
  | "charity"
  | "charity_ia"
  | "charity_clg"
  | "company"
  | "smsf"
  | "partnership"
  | "unit_trust"
  | "bare_trust"
  | "individual_tax_return"
  | "sole_trader_tax_return"
  | "bundle_tax_return"
  | "tfn"
  | "rental_properties"
  | "nfp_accounting"
  | "trust_accounting"
  | "company_accounting"
  | "asic_agent"
  | "smsf_accounting"
  | "partnership_tax"
  | "bookkeeping"
  | "payroll_services"
  | "business_plan"
  | "business_valuation"
  | "business_due_diligence"
  | "business_wealth_structuring";

export interface PricingPackage {
  foundation: {
    title: string;
    price: number;
    features: string[];
  };
  accounting: {
    includes: string[];
    extraCount: number;
  };
}

export interface TotalsResult {
  serviceFee: number;
  asicFee: number;
  accountingFee: number;
  payrollFee: number;
  subtotalExGst: number;
  gst: number;
  totalIncGst: number;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  return `$${amount.toLocaleString("en-AU")}`;
};

export const calculateTotals = (params: {
  serviceFee: number;
  asicFee: number;
  accountingFee: number;
  payrollFee: number;
  annualSavings?: number;
}): TotalsResult => {
  const { serviceFee, asicFee, accountingFee, payrollFee, annualSavings = 0 } = params;
  
  // ASIC fees are GST-free, other fees are taxable
  const taxableAmount = serviceFee + accountingFee + payrollFee - annualSavings;
  const gst = Math.round(taxableAmount * 0.1);
  const subtotalExGst = serviceFee + asicFee + accountingFee + payrollFee - annualSavings;
  const totalIncGst = subtotalExGst + gst;
  
  return {
    serviceFee,
    asicFee,
    accountingFee,
    payrollFee,
    subtotalExGst,
    gst,
    totalIncGst,
  };
};

export const PRICING_PACKAGES_BASE: Record<string, PricingPackage> = {
  abn: {
    foundation: {
      title: "ABN Registration (One-Time Setup)",
      price: 99,
      features: [
        "ABN Registration with ATO",
        "TFN Application (if required)",
        "GST Registration (Add-on Services)",
        "Register Business Name (Add-on Services)",
        "Business Structure Guidance",
        "Registered Office Address(Add-on Services)",
        "Basic Record-Keeping Guidance",
        "Compliance Calendar Overview (BAS, tax due dates)",
      ],
    },
    accounting: {
      includes: [
        "Everything in ABN Registration Plus;",
        "Monthly or Quarterly Bookkeeping",
        "BAS Preparation & Lodgement",
        "Annual Individual Tax Return",
        "GST Reconciliation",
        "PAYG Instalment Management",
        "Year-End Financial Summary",
      ],
      extraCount: 2,
    },
  },

  business_name: {
    foundation: {
      title: "Business Name Registration (One-Time)",
      price: 149,
      features: [
        "ASIC Business Name Registration",
        "Nationwide Name Availability Check",
        "Registered Office Address(Add-on Services)",
        "Domain Name Availability Check",
        "GST Registration (Add-on Services)",
        "Digital Business Name Certificate",
        "Compliance Calendar Overview (BAS, tax due dates)",
      ],
    },
    accounting: {
      includes: [
        "Everything in Business Name Registration Plus",
        "Monthly or Quarterly Bookkeeping",
        "BAS Preparation & Lodgement",
        "Annual Individual or Company Tax Return",
        "GST Reconciliation",
        "PAYG Instalment Management",
        "Year-End Financial Summary",
      ],
      extraCount: 2,
    },
  },

  family_trust: {
    foundation: {
      title: "Family Trust Setup (One-Time)",
      price: 799,
      features: [
        "Professionally Drafted Trust Deed",
        "Corporate Trustee Setup",
        "ABN & TFN Registration for Trust",
        "Stamp Duty Compliance Guidance (State-Based)",
        "Trust Establishment Minutes & Resolutions",
        "Beneficiary Class Structuring",
        "Appointor Documentation",
        "Digital Trust Document Pack",
        "GST Registration (Add-on Services)",
        "Register Business Name (Add-on Services)",
        "Registered Office Address(Add-on Services)",
      ],
    },
    accounting: {
      includes: [
        "Everything in Family Trust Setup Plus",
        "Monthly or Quarterly Trust Bookkeeping",
        "Quarterly BAS Preparation & Lodgement",
        "Annual Trust Tax Return Preparation",
        "Trust Distribution Resolutions",
        "Beneficiary Tax Planning Strategy",
        "Financial Statements & Year-End Reports",
        "ATO Correspondence Management",
      ],
      extraCount: 2,
    },
  },

  gst: {
    foundation: {
      title: "GST Registration (One-Time)",
      price: 49,
      features: [
        "GST Registration with ATO",
        "ABN Validation & Status Update",
        "GST Reporting Cycle Setup (Monthly or Quarterly)",
        "Tax Agent Nomination & Access Setup",
        "GST Accounting Method Selection (Cash or Accrual)",
        "Input Tax Credit Overview Guidance",
        "Compliance Calendar Overview (BAS, tax due dates)",
      ],
    },
    accounting: {
      includes: [
        "Monthly Bookkeeping & Bank Reconciliation",
        "Quarterly or Monthly BAS Preparation",
        "BAS Lodgement with ATO",
        "GST Reconciliation & Reporting",
      ],
      extraCount: 8,
    },
  },

  charity_ia: {
    foundation: {
      title: "Incorporated Association Setup",
      price: 1399,
      features: [
        "State-Based Incorporated Association Registration",
        "Constitution Template (Compliant Framework)",
        "Responsible Persons & Office Bearer Documentation",
        "ABN Registration",
        "TFN Registration",
        "ACNC Charity Registration Application (Subject to Eligibility)",
        "ATO Charity Tax Concession Endorsement Application (Where Applicable)",
        "Public Charity Register Listing (Upon Regulatory Approval)",
        "Digital Governance Document Pack",
        "Compliance Calendar Overview",
      ],
    },
    accounting: {
      includes: [
        "Everything in Incorporated Association Setup Plus",
        "Charity Bookkeeping & Fund Accounting",
        "ACNC Annual Information Statement Preparation",
        "Financial Statements Preparation (Tier-Based)",
        "ATO Reporting & Charity Compliance Monitoring",
        "Donor Receipt & Tax Deductibility Administration",
        "Grant & Funding Reporting Support",
        "Governance Review & Compliance Monitoring",
      ],
      extraCount: 2,
    },
  },

  charity_clg: {
    foundation: {
      title: "Company Limited by Guarantee Setup",
      price: 1499,
      features: [
        "ASIC Company Limited by Guarantee Registration",
        "Company Constitution",
        "Director & Member Documentation Setup",
        "ABN Registration",
        "TFN Registration",
        "ACNC Charity Registration Application (Subject to ACNC Approval)",
        "DGR Application Support (Subject to ATO Approval)",
        "ATO Charity Tax Concession Endorsement Application (Where Applicable)",
        "ACNC Public Register Listing (Upon Regulatory Approval)",
        "Digital Governance Document Pack",
        "Compliance Calendar Overview",
      ],
    },
    accounting: {
      includes: [
        "Everything in CLG Setup Plus",
        "Charity Bookkeeping & Fund Accounting",
        "Financial Statement Preparation (Tier-Based)",
        "ACNC Annual Information Statement Preparation",
        "ASIC Annual Review Compliance",
        "Donor Receipt & Tax Deductibility Administration",
        "ATO Reporting & Charity Compliance Monitoring",
        "Governance & Board Reporting Support",
      ],
      extraCount: 2,
    },
  },

  charity: {
    foundation: {
      title: "Foundation Setup",
      price: 899,
      features: [
        "ACNC Charity Registration",
        "DGR Status Application (if eligible)",
        "Charity Constitution & Governing Documents",
        "ABN & TFN Registration for Charity",
        "Charity Subtype Selection & Classification",
        "Responsible Persons Registration",
        "Public Charity Register Listing",
        "Tax Concession Applications",
        "GST Concession Registration",
        "FBT & Payroll Tax Exemptions",
        "Fundraising Permit Guidance",
        "Compliance Framework Setup",
      ],
    },
    accounting: {
      includes: [
        "Charity Bookkeeping & Fund Accounting",
        "Annual Financial Statement Preparation (ACNC)",
        "ACNC Annual Information Statement",
        "Donor Receipt & Tax Deduction Management",
      ],
      extraCount: 10,
    },
  },

  company: {
    foundation: {
      title: "Company Registration (One-Time)",
      price: 399,
      features: [
        "ASIC Company Registration",
        "ACN & TFN Application",
        "ABN Registration",
        "Company Constitution",
        "Share Certificates",
        "ASIC Annual Review Setup",
        "Company Compliance Guide",
        "GST Registration (Add-on Services)",
        "Register Business Name (Add-on Services)",
        "Registered Office Address(Add-on Services)",
        "Free Name Availability Check",
      ],
    },
    accounting: {
      includes: [
        "Everything in Company Registration Plus",
        "Monthly Bookkeeping & Bank Reconciliation",
        "Quarterly or Monthly BAS Preparation",
        "Annual Financial Statements Preparation",
        "Company Tax Return Lodgement",
        "PAYG Instalment Management",
        "Payroll & Super Compliance (If Required)",
        "ATO Correspondence Management",
        "Year-End Tax Planning Review",
      ],
      extraCount: 2,
    },
  },

  smsf: {
    foundation: {
      title: "SMSF Setup (One-Time)",
      price: 1399,
      features: [
        "Professional SMSF Trust Deed",
        "Corporate Trustee Company Establishment",
        "SMSF ABN & TFN Registration",
        "ATO SMSF Registration & Regulator Notification",
        "Electronic Service Address (ESA) Setup",
        "SMSF Bank Account Setup Guidance",
        "Trustee Declarations & Establishment Minutes",
        "Member Application & Consent Documentation",
        "Digital SMSF Document Pack",
        "Compliance Calendar Overview",
      ],
    },
    accounting: {
      includes: [
        "Everything in SMSF Setup Plus",
        "SMSF Bookkeeping & Transaction Recording",
        "Annual SMSF Financial Statements",
        "SMSF Annual Return Lodgement with ATO",
        "Independent SMSF Audit Coordination",
        "Contribution & Pension Reporting",
        "Minimum Pension Compliance Monitoring",
        "ATO Correspondence Management",
        "Year-End Compliance Review",
      ],
      extraCount: 2,
    },
  },

  partnership: {
    foundation: {
      title: "Partnership Registration (One-Time)",
      price: 299,
      features: [
        "Partnership Agreement Template",
        "ABN Registration for Partnership",
        "TFN Registration for Partnership",
        "Profit & Loss Sharing Structure Documentation",
        "Partner Capital Account Setup Guidance",
        "Bank Account Setup Guidance",
        "GST Registration (Add-on Services)",
        "Register Business Name (Add-on Services)",
        "Registered Office Address(Add-on Services)",
        "Digital Partnership Document Pack",
        "Compliance Calendar Overview",
      ],
    },
    accounting: {
      includes: [
        "Everything in Partnership Registration Plus",
        "Monthly Partnership Bookkeeping",
        "Quarterly BAS Preparation & Lodgement",
        "Annual Partnership Tax Return Preparation",
        "Partner Distribution Statements",
        "Financial Statements Preparation",
        "ATO Correspondence Management",
        "Year-End Tax Planning Review",
      ],
      extraCount: 2,
    },
  },

  unit_trust: {
    foundation: {
      title: "Unit Trust Setup (One-Time)",
      price: 799,
      features: [
        "Professional Unit Trust Deed Preparation",
        "Corporate Trustee Establishment",
        "ABN & TFN Registration for Trust",
        "Register of Unitholders Setup",
        "Initial Unit Allocation & Certificate Issuance",
        "Trust Establishment Minutes & Resolutions",
        "Stamp Duty Guidance (State-Based Requirements)",
        "ATO Registration & Tax Record Setup",
        "Digital Document Pack for Secure Storage",
        "GST Registration (Add-on Services)",
        "Register Business Name (Add-on Services)",
        "Registered Office Address(Add-on Services)",
        "Compliance Calendar Overview (BAS, tax due dates)",
      ],
    },
    accounting: {
      includes: [
        "Everything in Unit Trust Setup Plus",
        "Monthly or Quarterly Trust Bookkeeping",
        "Quarterly BAS Preparation & Lodgement (If Registered)",
        "Annual Trust Tax Return Preparation",
        "Unit Holder Distribution Calculations",
        "Financial Statements & Year-End Reporting",
        "ATO Correspondence Management",
        "Ongoing Compliance Monitoring",
      ],
      extraCount: 2,
    },
  },

  bare_trust: {
    foundation: {
      title: "Bare Trust Registeration (One Time)",
      price: 799,
      features: [
        "Bare Trust Deed Preparation",
        "Trustee Appointment & Resolutions",
        "ABN Registration (if required)",
        "ATO Compliance Guide",
        "Trust Resolutions & Minutes",
        "Ongoing Compliance Checklist",
      ],
    },
    accounting: {
      includes: [
        "Everything in Bare Trust Setup Plus",
        "SMSF Bookkeeping & Transaction Recording",
        "Annual SMSF Financial Statements",
        "SMSF Annual Return Lodgement with ATO",
        "Independent SMSF Audit Coordination",
        "Contribution & Pension Reporting",
        "Minimum Pension Compliance Monitoring",
        "ATO Correspondence Management",
        "Year-End Compliance Review",
      ],
      extraCount: 2,
    },
  },
};

export const PRICING_PACKAGES_EXTRA: Record<string, PricingPackage> = {
  individual_tax_return: {
    foundation: {
      title: "Individual Tax Return",
      price: 120,
      features: [
        "PAYG Income Assessment",
        "ATO Pre-Fill Data Review",
        "Standard Deduction Review",
        "Medicare Levy Calculation",
        "Private Health Insurance Rebate Calculation (If Applicable)",
        "Electronic Lodgement with ATO",
        "Tax Return Summary & Review",
        "Tax Offset Eligibility",
      ],
    },
    accounting: {
      includes: [
        "Everything in Essential Plan",
        "ATO Correspondence Support",
        "Enhanced Deduction Review",
        "Priority Processing (24–48 Hour Turnaround)",
        "Dedicated Tax Specialist",
        "Free 15-Min Strategy Call",
      ],
      extraCount: 2,
    },
  },
  sole_trader_tax_return: {
    foundation: {
      title: "Sole Trader Tax Return",
      price: 160,
      features: [
        "Sole Trader Tax Return Preparation",
        "Business Income & Expense Analysis",
        "Motor Vehicle Claims Calculation",
        "Home Office Expense Calculation",
        "Depreciation Schedule Preparation",
        "BAS Reconciliation & Review",
        "GST Reporting & Compliance",
        "ATO Pre-fill Data Review",
        "Business Loss Provisions Review",
      ],
    },
    accounting: {
      includes: [
        "Monthly Bookkeeping & Reconciliation",
        "Quarterly BAS Preparation & Lodgement",
        "Annual Tax Return Lodgement",
        "Tax Planning Consultation",
      ],
      extraCount: 6,
    },
  },
  bundle_tax_return: {
    foundation: {
      title: "Bundle Tax Return Package",
      price: 160,
      features: [
        "Individual + Business Tax Return Package",
        "Combined Income Assessment",
        "Cross-Entity Tax Optimisation",
        "Trust Distribution Integration",
        "Company Dividend Integration",
        "Capital Gains Consolidation",
        "Multi-Entity BAS Review",
        "ATO Compliance Review",
        "Comprehensive Tax Planning",
      ],
    },
    accounting: {
      includes: [
        "Multi-Entity Bookkeeping",
        "Consolidated BAS Preparation",
        "All Entity Tax Returns",
        "Strategic Tax Advisory",
      ],
      extraCount: 6,
    },
  },
  tfn: {
    foundation: {
      title: "TFN Registration",
      price: 120,
      features: [
        "Tax File Number Application",
        "ATO Registration & Submission",
        "Identity Verification Assistance",
        "TFN Notification to Employers",
        "TFN Declaration Preparation",
        "ABN Linking (if applicable)",
      ],
    },
    accounting: {
      includes: [
        "Ongoing Tax Advisory Support",
        "ATO Correspondence Management",
        "Tax Return Preparation",
        "Compliance Monitoring",
      ],
      extraCount: 4,
    },
  },
  rental_properties: {
    foundation: {
      title: "Rental Properties",
      price: 50,
      features: [
        "Investment Property Tax Schedule",
        "Rental Income & Expense Tracking",
        "Depreciation Schedule Preparation",
        "Capital Gains Tax Calculation",
        "Negative Gearing Assessment",
        "Property Settlement Support",
      ],
    },
    accounting: {
      includes: [
        "Ongoing Rental Property Advisory",
        "Annual Rental Schedule Preparation",
        "Property Portfolio Review",
        "Capital Gains Planning",
      ],
      extraCount: 4,
    },
  },
  nfp_accounting: {
    foundation: {
      title: "NFP Accounting Package",
      price: 99,
      features: [
        "NFP Financial Reporting",
        "Fund & Grant Tracking",
        "Donor Management & Receipting",
        "ACNC Annual Information Statement",
        "BAS Preparation & Lodgement",
        "Payroll Processing",
        "FBT Compliance",
        "Budget vs Actual Reporting",
        "Financial Audit Preparation",
      ],
    },
    accounting: {
      includes: [
        "Dedicated NFP Accountant",
        "Cloud Accounting Setup",
        "Monthly Financial Reports",
        "Grant Acquittal Support",
      ],
      extraCount: 8,
    },
  },
  trust_accounting: {
    foundation: {
      title: "Trust Accounting Package",
      price: 77,
      features: [
        "Trust Transaction Recording",
        "Trust Distribution Calculations",
        "Beneficiary Statements",
        "Trust Tax Return Preparation",
        "BAS Preparation & Lodgement",
        "Trust Investment Reporting",
        "Trustee Resolution Documentation",
        "ATO Compliance Management",
        "Year-End Financial Statements",
      ],
    },
    accounting: {
      includes: [
        "Dedicated Trust Accountant",
        "Cloud Accounting Setup",
        "Quarterly Trust Reviews",
        "Annual Distribution Planning",
      ],
      extraCount: 8,
    },
  },
  company_accounting: {
    foundation: {
      title: "Company Accounting Package",
      price: 99,
      features: [
        "Monthly Financial Reporting",
        "Bank & Credit Card Reconciliation",
        "Accounts Payable Management",
        "Accounts Receivable Management",
        "Payroll Processing",
        "BAS Preparation & Lodgement",
        "Annual Financial Statements",
        "Company Tax Return Lodgement",
        "ASIC Annual Review",
      ],
    },
    accounting: {
      includes: [
        "Dedicated Accountant",
        "Cloud Accounting Software Setup",
        "Monthly Management Reports",
        "Quarterly Review Meetings",
      ],
      extraCount: 8,
    },
  },
  asic_agent: {
    foundation: {
      title: "ASIC Annual Revieww",
      price: 180,
      features: [
        "ASIC Annual Review Monitoring",
        "Registered Office & Company Details Review",
        "Director & Secretary Change Processing (If Required)",
        "Share Structure Review",
        "Solvency Resolution Preparation",
        "ASIC Annual Fee Payment Coordination",
        "Change of Details Lodgement (Where Applicable)",
        "Compliance Deadline Monitoring & Reminders",
        "ASIC Correspondence Handling",
      ],
    },
    accounting: {
      includes: [
        "Everything in ASIC Annual Review Management",
        "Annual Company Financial Statements",
        "Company Tax Return Preparation & Lodgement",
        "BAS Preparation & Lodgement (If Registered)",
        "Bookkeeping & Bank Reconciliation",
        "PAYG & Superannuation Reporting (If Applicable)",
        "ATO Compliance Monitoring",
        "Year-End Tax Planning Review",
      ],
      extraCount: 2,
    },
  },
  smsf_accounting: {
    foundation: {
      title: "SMSF Accounting Package",
      price: 99,
      features: [
        "Annual Financial Statements",
        "SMSF Tax Return Lodgement",
        "Member Statements",
        "Audit Liaison & Lodgement",
        "Rollover Processing",
        "Pension Calculations",
        "Investment Reporting",
        "ATO Compliance Management",
        "Year-End Financial Statements",
      ],
    },
    accounting: {
      includes: [
        "Dedicated SMSF Accountant",
        "Cloud Accounting Setup",
        "Quarterly SMSF Reviews",
        "Annual Audit Coordination",
      ],
      extraCount: 8,
    },
  },
  partnership_tax: {
    foundation: {
      title: "Partnership Tax Package",
      price: 85,
      features: [
        "Partnership Tax Returns",
        "Profit Distribution",
        "Partner Capital Tracking",
        "Partnership BAS",
        "Partner Statements",
        "Capital Account Management",
        "Tax Planning Support",
        "ATO Compliance Management",
        "Year-End Financial Statements",
      ],
    },
    accounting: {
      includes: [
        "Dedicated Partnership Accountant",
        "Cloud Accounting Setup",
        "Quarterly Reviews",
        "Annual Tax Planning",
      ],
      extraCount: 8,
    },
  },
  business_plan: {
    foundation: {
      title: "Business Plan",
      price: 990,
      features: [
        "3-5 Year Financial Projections (P&L, Cash Flow)",
        "Market Analysis & Competitor Research",
        "Executive Summary & Business Overview",
        "Marketing & Sales Strategy",
        "Professional Graphic Design",
        "Unlimited Revisions (30 Days)",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
  business_valuation: {
    foundation: {
      title: "Business Valuation",
      price: 1399,
      features: [
        "Short-form Business Appraisal Report",
        "Estimate of Business Value",
        "Industry Benchmarking Analysis",
        "Pre-release Discussion with Experts",
        "Business & Industry Risk Assessment",
        "Court-Acceptable Documentation",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
  business_due_diligence: {
    foundation: {
      title: "Business Due Diligence",
      price: 500,
      features: [
        "2 Year Financial Statement Analysis",
        "Revenue & Profit Trend Review",
        "Expense and Margin Analysis",
        "Basic Cash Flow Review",
        "Working Capital Health Check",
        "Industry Ratio Comparison",
        "Risk Flag Summary Report",
        "30 Min Strategy Call",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
  business_wealth_structuring: {
    foundation: {
      title: "Business & Wealth Structuring",
      price: 500,
      features: [
        "Entity Structure Review & Optimisation",
        "Asset Protection Strategy",
        "Tax-Effective Wealth Structuring",
        "Trust & Company Setup Guidance",
        "Succession Planning Framework",
        "Investment Vehicle Recommendations",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
  bookkeeping: {
    foundation: {
      title: "Bookkeeping Services",
      price: 150,
      features: [
        "Monthly bookkeeping & reconciliation",
        "BAS preparation & lodgement",
        "QuickBooks Online included",
        "ATO correspondence support",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
  payroll_services: {
    foundation: {
      title: "Payroll Services",
      price: 99,
      features: [
        "STP Phase 2 lodgement every pay run",
        "12% super guarantee processing",
        "PAYG withholding & payslips",
        "EOFY finalisation & ATO compliance",
      ],
    },
    accounting: { includes: [], extraCount: 0 },
  },
};

// Merge base + extra into full record
export const PRICING_PACKAGES: Record<PricingServiceKey, PricingPackage> = {
  ...PRICING_PACKAGES_BASE,
  ...PRICING_PACKAGES_EXTRA,
} as Record<PricingServiceKey, PricingPackage>;

// Helper to get service display name for "Get everything in X Registration plus..."
export const SERVICE_DISPLAY_NAMES: Record<PricingServiceKey, string> = {
  abn: "ABN Registration",
  business_name: "Business Name",
  family_trust: "Family Trust",
  gst: "GST Registration",
  charity: "Charity Setup",
  company: "Company Registration",
  smsf: "SMSF Setup",
  partnership: "Partnership",
  unit_trust: "Unit Trust",
  bare_trust: "Bare Trust",
  charity_ia: "Incorporated Association",
  charity_clg: "Company Limited by Guarantee",
  individual_tax_return: "Individual Tax Return",
  sole_trader_tax_return: "Sole Trader Tax Return",
  bundle_tax_return: "Bundle Tax Return",
  tfn: "TFN Registration",
  rental_properties: "Rental Properties",
  nfp_accounting: "NFP Accounting",
  trust_accounting: "Trust Accounting",
  company_accounting: "Company Accounting",
  asic_agent: "ASIC Annual Review Agent",
  smsf_accounting: "SMSF Accounting",
  partnership_tax: "Partnership Tax",
  bookkeeping: "Bookkeeping Services",
  payroll_services: "Payroll Services",
  business_plan: "Business Plan",
  business_valuation: "Business Valuation",
  business_due_diligence: "Business Due Diligence",
  business_wealth_structuring: "Business & Wealth Structuring",
};
