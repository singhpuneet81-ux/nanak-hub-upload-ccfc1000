export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  serviceFee: number;
  showBusinessStructure: boolean;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: "setups-registrations",
    name: "Setups & Registrations",
    slug: "setups-registrations",
  },
  {
    id: "tax-compliance",
    name: "Tax & Compliance",
    slug: "tax-compliance",
  },
  {
    id: "business-services",
    name: "Business Services",
    slug: "business-services",
  },
];

export const services: Service[] = [
  {
    id: "abn-registration",
    name: "ABN Registration",
    description: "Get your Australian Business Number registered quickly",
    categoryId: "setups-registrations",
    serviceFee: 149,
    showBusinessStructure: true,
    icon: "FileText",
  },
  {
    id: "business-name-registration",
    name: "Business Name Registration",
    description: "Register your unique business name nationwide",
    categoryId: "setups-registrations",
    serviceFee: 149,
    showBusinessStructure: true,
    icon: "Building2",
  },
  {
    id: "family-trust-setup",
    name: "Family Trust Setup",
    description: "Protect and manage family wealth efficiently",
    categoryId: "setups-registrations",
    serviceFee: 499,
    showBusinessStructure: false,
    icon: "Users",
  },
  {
    id: "gst-registration",
    name: "GST Registration",
    description: "Register for Goods and Services Tax compliance",
    categoryId: "setups-registrations",
    serviceFee: 149,
    showBusinessStructure: true,
    icon: "Receipt",
  },
  {
    id: "register-charity",
    name: "Register a Charity",
    description: "Set up your charitable organization properly",
    categoryId: "setups-registrations",
    serviceFee: 599,
    showBusinessStructure: false,
    icon: "Heart",
  },
  {
    id: "register-company",
    name: "Register a Company",
    description: "Incorporate your company with ASIC registration",
    categoryId: "setups-registrations",
    serviceFee: 649,
    showBusinessStructure: false,
    icon: "Building",
  },
  {
    id: "smsf-setup",
    name: "SMSF Setup",
    description: "Self-Managed Super Fund establishment and compliance",
    categoryId: "setups-registrations",
    serviceFee: 999,
    showBusinessStructure: false,
    icon: "Wallet",
  },
];

export const businessStructures = [
  { value: "", label: "Please Select" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company" },
  { value: "trust", label: "Trust" },
  { value: "family_trust", label: "Family Trust" },
  { value: "unit_trust", label: "Unit Trust" },
];

export const australianStates = [
  { value: "", label: "Select State" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

export const getServiceById = (id: string): Service | undefined => {
  return services.find((s) => s.id === id);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((c) => c.id === id);
};

export const getServicesByCategory = (categoryId: string): Service[] => {
  return services.filter((s) => s.categoryId === categoryId);
};
