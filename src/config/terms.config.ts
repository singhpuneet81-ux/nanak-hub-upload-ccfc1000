export interface RegistrationTerm {
  id: string;
  label: string;
  duration: string;
  asicFee: number;
  features: string[];
  isRecommended: boolean;
  savingsText?: string;
}

export const registrationTerms: RegistrationTerm[] = [
  {
    id: "1_year",
    label: "1 Year Registration",
    duration: "Standard registration period",
    asicFee: 45,
    features: [
      "Valid for 12 months",
      "Renewal reminder included",
      "Certificate of registration",
    ],
    isRecommended: false,
  },
  {
    id: "3_year",
    label: "3 Year Registration",
    duration: "Best value - save time and money",
    asicFee: 104,
    features: [
      "Valid for 36 months",
      "Lock in current rates",
      "Certificate of registration",
      "Priority support",
    ],
    isRecommended: true,
    savingsText: "Save $100 vs annual renewals",
  },
];

export const getTermById = (id: string): RegistrationTerm | undefined => {
  return registrationTerms.find((t) => t.id === id);
};
