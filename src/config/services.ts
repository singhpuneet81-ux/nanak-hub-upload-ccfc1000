import { PricingServiceKey, ServiceConfig } from "@/types/services";

export const SERVICE_DISPLAY_NAMES: Record<PricingServiceKey, string> = {
  abn: "ABN Registration",
  business_name: "Business Name Registration",
  gst: "GST Registration",
  family_trust: "Family Trust Setup",
  charity: "Charity Registration",
  company: "Company Registration",
  smsf: "SMSF Setup",
};

export const SLUG_TO_SERVICE_KEY: Record<string, PricingServiceKey> = {
  "abn-registration": "abn",
  "business-name-registration": "business_name",
  "gst-registration": "gst",
  "family-trust-setup": "family_trust",
  "charity-registration": "charity",
  "company-registration": "company",
  "smsf-setup": "smsf",
};

export const SERVICE_CONFIGS: Record<PricingServiceKey, ServiceConfig> = {
  abn: {
    serviceKey: "abn",
    displayName: "ABN Registration",
    description: "Register your Australian Business Number quickly and easily",
    foundationPrice: 49,
    govtFee: 0,
    formFields: [
      { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true, halfWidth: true },
      {
        name: "businessStructure", label: "Business Structure", type: "select", required: true,
        options: [
          { label: "Sole Trader", value: "sole_trader" },
          { label: "Partnership", value: "partnership" },
          { label: "Company", value: "company" },
          { label: "Trust", value: "trust" },
        ],
      },
      { name: "businessDescription", label: "Business Description", type: "textarea", required: true, placeholder: "Describe your business activities..." },
      { name: "businessAddress", label: "Business Address", type: "text", required: true, placeholder: "123 Main St, Sydney NSW 2000" },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Starter", monthlyPrice: 99,
        features: ["Quarterly BAS lodgement", "Basic bookkeeping", "Email support"],
      },
      {
        id: "growth", name: "Growth", monthlyPrice: 199, popular: true,
        features: ["Monthly BAS lodgement", "Full bookkeeping", "Tax return preparation", "Phone & email support", "Quarterly review meetings"],
      },
      {
        id: "premium", name: "Premium", monthlyPrice: 349,
        features: ["Monthly BAS lodgement", "Full bookkeeping", "Tax return preparation", "Dedicated accountant", "Unlimited support", "Tax planning advice"],
      },
    ],
    addOns: [
      { id: "express", name: "Express Processing", price: 99, description: "Get your ABN within 24 hours" },
      { id: "tax_consult", name: "Tax Consultation", price: 149, description: "30-min session with a tax specialist" },
    ],
  },
  business_name: {
    serviceKey: "business_name",
    displayName: "Business Name Registration",
    description: "Register your business name with ASIC",
    foundationPrice: 99,
    govtFee: 39,
    formFields: [
      { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "existingAbn", label: "Existing ABN (if any)", type: "text", placeholder: "XX XXX XXX XXX", halfWidth: true },
      { name: "proposedName", label: "Proposed Business Name", type: "text", required: true, placeholder: "My Business Pty Ltd" },
      { name: "businessAddress", label: "Business Address", type: "text", required: true, placeholder: "123 Main St, Sydney NSW 2000" },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Starter", monthlyPrice: 99,
        features: ["Quarterly BAS lodgement", "Basic bookkeeping", "Email support"],
      },
      {
        id: "growth", name: "Growth", monthlyPrice: 199, popular: true,
        features: ["Monthly BAS lodgement", "Full bookkeeping", "Tax return preparation", "Phone & email support"],
      },
      {
        id: "premium", name: "Premium", monthlyPrice: 349,
        features: ["All Growth features", "Dedicated accountant", "Unlimited support", "Tax planning advice"],
      },
    ],
    addOns: [
      { id: "express", name: "Express Processing", price: 79, description: "Priority processing within 48 hours" },
      { id: "domain", name: "Domain Name Registration", price: 29, description: "Register a matching .com.au domain", recurring: true },
    ],
  },
  gst: {
    serviceKey: "gst",
    displayName: "GST Registration",
    description: "Register for Goods and Services Tax",
    foundationPrice: 49,
    govtFee: 0,
    formFields: [
      { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "abn", label: "ABN", type: "text", required: true, placeholder: "XX XXX XXX XXX", halfWidth: true },
      { name: "estimatedTurnover", label: "Estimated Annual Turnover", type: "select", required: true,
        options: [
          { label: "Under $75,000", value: "under_75k" },
          { label: "$75,000 - $150,000", value: "75k_150k" },
          { label: "$150,000 - $500,000", value: "150k_500k" },
          { label: "Over $500,000", value: "over_500k" },
        ],
      },
      { name: "gstStartDate", label: "GST Start Date", type: "date", required: true },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Starter", monthlyPrice: 99,
        features: ["Quarterly BAS lodgement", "Basic bookkeeping", "Email support"],
      },
      {
        id: "growth", name: "Growth", monthlyPrice: 199, popular: true,
        features: ["Monthly BAS lodgement", "Full bookkeeping", "Tax return preparation", "Phone & email support"],
      },
      {
        id: "premium", name: "Premium", monthlyPrice: 349,
        features: ["All Growth features", "Dedicated accountant", "Unlimited support"],
      },
    ],
    addOns: [
      { id: "bas_setup", name: "BAS Setup Assistance", price: 79, description: "Help setting up your BAS reporting" },
    ],
  },
  family_trust: {
    serviceKey: "family_trust",
    displayName: "Family Trust Setup",
    description: "Establish a discretionary family trust",
    foundationPrice: 599,
    govtFee: 0,
    formFields: [
      { name: "fullName", label: "Full Name (Settlor)", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "trustName", label: "Proposed Trust Name", type: "text", required: true, placeholder: "Smith Family Trust", halfWidth: true },
      { name: "trusteeName", label: "Trustee Name", type: "text", required: true, placeholder: "Full name of trustee" },
      { name: "trusteeType", label: "Trustee Type", type: "select", required: true,
        options: [
          { label: "Individual", value: "individual" },
          { label: "Corporate (Company as Trustee)", value: "corporate" },
        ],
      },
      { name: "companyTrusteeName", label: "Company Trustee Name", type: "text", placeholder: "Company name (if corporate trustee)",
        conditionalOn: { field: "trusteeType", value: "corporate" },
      },
      { name: "beneficiaries", label: "Primary Beneficiaries", type: "textarea", required: true, placeholder: "List the primary beneficiaries of the trust..." },
      { name: "trustAddress", label: "Trust Address", type: "text", required: true, placeholder: "123 Main St, Sydney NSW 2000" },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Essential", monthlyPrice: 149,
        features: ["Annual trust tax return", "Basic bookkeeping", "Distribution minutes", "Email support"],
      },
      {
        id: "growth", name: "Professional", monthlyPrice: 299, popular: true,
        features: ["Annual trust tax return", "Full bookkeeping", "Distribution planning", "Phone & email support", "Quarterly reviews"],
      },
      {
        id: "premium", name: "Comprehensive", monthlyPrice: 499,
        features: ["All Professional features", "Asset protection advice", "Dedicated accountant", "Unlimited support", "Tax planning"],
      },
    ],
    addOns: [
      { id: "corporate_trustee", name: "Corporate Trustee Setup", price: 399, description: "Register a company to act as trustee" },
      { id: "stamp_duty", name: "Stamp Duty Assistance", price: 149, description: "Help with state-based stamp duty requirements" },
      { id: "tfn", name: "TFN Application", price: 49, description: "Apply for a Tax File Number for the trust" },
    ],
  },
  charity: {
    serviceKey: "charity",
    displayName: "Charity Registration",
    description: "Register your organisation as a charity with the ACNC",
    foundationPrice: 799,
    govtFee: 0,
    formFields: [
      { name: "fullName", label: "Contact Person", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX" },
      { name: "charityName", label: "Proposed Charity Name", type: "text", required: true, placeholder: "Smith Foundation" },
      { name: "charityPurpose", label: "Charitable Purpose", type: "textarea", required: true, placeholder: "Describe the charitable purpose..." },
      { name: "charityAddress", label: "Registered Address", type: "text", required: true, placeholder: "123 Main St, Sydney NSW 2000" },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Basic", monthlyPrice: 149,
        features: ["Annual reporting to ACNC", "Basic bookkeeping", "Email support"],
      },
      {
        id: "growth", name: "Standard", monthlyPrice: 279, popular: true,
        features: ["ACNC annual reporting", "Full bookkeeping", "DGR compliance", "Phone & email support"],
      },
      {
        id: "premium", name: "Full Service", monthlyPrice: 449,
        features: ["All Standard features", "Grant reporting", "Dedicated accountant", "Audit preparation"],
      },
    ],
    addOns: [
      { id: "dgr", name: "DGR Endorsement", price: 299, description: "Apply for Deductible Gift Recipient status" },
      { id: "constitution", name: "Constitution Drafting", price: 199, description: "Draft a compliant charity constitution" },
    ],
  },
  company: {
    serviceKey: "company",
    displayName: "Company Registration",
    description: "Register a proprietary limited company with ASIC",
    foundationPrice: 499,
    govtFee: 538,
    formFields: [
      { name: "fullName", label: "Director Full Name", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true, halfWidth: true },
      { name: "companyName", label: "Proposed Company Name", type: "text", required: true, placeholder: "Smith Holdings Pty Ltd" },
      { name: "companyType", label: "Company Type", type: "select", required: true,
        options: [
          { label: "Proprietary Limited (Pty Ltd)", value: "pty_ltd" },
          { label: "Public Company", value: "public" },
        ],
      },
      { name: "shareholders", label: "Shareholders", type: "textarea", required: true, placeholder: "List shareholders and their share allocation..." },
      { name: "registeredAddress", label: "Registered Office Address", type: "text", required: true, placeholder: "123 Main St, Sydney NSW 2000" },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Startup", monthlyPrice: 149,
        features: ["Annual company tax return", "Basic bookkeeping", "ASIC annual review", "Email support"],
      },
      {
        id: "growth", name: "Business", monthlyPrice: 299, popular: true,
        features: ["Company tax return", "Full bookkeeping", "BAS lodgement", "ASIC compliance", "Quarterly reviews"],
      },
      {
        id: "premium", name: "Enterprise", monthlyPrice: 499,
        features: ["All Business features", "Payroll management", "Dedicated accountant", "Unlimited support", "Strategic advice"],
      },
    ],
    addOns: [
      { id: "asic_agent", name: "ASIC Registered Agent", price: 99, description: "We handle all ASIC correspondence", recurring: true },
      { id: "share_cert", name: "Share Certificates", price: 49, description: "Professionally prepared share certificates" },
    ],
  },
  smsf: {
    serviceKey: "smsf",
    displayName: "SMSF Setup",
    description: "Establish a Self-Managed Super Fund",
    foundationPrice: 899,
    govtFee: 0,
    formFields: [
      { name: "fullName", label: "Full Name (Member 1)", type: "text", required: true, placeholder: "John Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "04XX XXX XXX", halfWidth: true },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true, halfWidth: true },
      { name: "fundName", label: "Proposed Fund Name", type: "text", required: true, placeholder: "Smith Super Fund" },
      { name: "numberOfMembers", label: "Number of Members", type: "select", required: true,
        options: [
          { label: "1 Member", value: "1" },
          { label: "2 Members", value: "2" },
          { label: "3 Members", value: "3" },
          { label: "4 Members", value: "4" },
        ],
      },
      { name: "existingSuper", label: "Existing Super Fund(s) to Rollover", type: "textarea", placeholder: "List fund names and approximate balances..." },
      { name: "investmentStrategy", label: "Investment Preferences", type: "select", required: true,
        options: [
          { label: "Conservative", value: "conservative" },
          { label: "Balanced", value: "balanced" },
          { label: "Growth", value: "growth" },
          { label: "Aggressive", value: "aggressive" },
        ],
      },
    ],
    accountingPackages: [
      {
        id: "starter", name: "Core", monthlyPrice: 199,
        features: ["Annual SMSF tax return", "Annual audit coordination", "Member statements", "Email support"],
      },
      {
        id: "growth", name: "Complete", monthlyPrice: 349, popular: true,
        features: ["SMSF tax return", "Audit coordination", "Investment reporting", "Rollover management", "Phone & email support"],
      },
      {
        id: "premium", name: "Full Management", monthlyPrice: 549,
        features: ["All Complete features", "Strategy review", "Pension management", "Dedicated SMSF specialist", "Unlimited support"],
      },
    ],
    addOns: [
      { id: "corporate_trustee", name: "Corporate Trustee Setup", price: 399, description: "Register a company as SMSF trustee" },
      { id: "rollover", name: "Super Rollover Assistance", price: 99, description: "We handle the rollover from existing funds" },
      { id: "investment_strategy", name: "Investment Strategy Document", price: 149, description: "Compliant investment strategy documentation" },
    ],
  },
};
