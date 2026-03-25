export interface PayrollOption {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
  pricePerStaff: number;
  icon: string;
}

export const payrollOptions: PayrollOption[] = [
  {
    id: "no_payroll",
    name: "No Payroll Needed",
    subtitle: "Just me for now",
    description: "Perfect for solo founders and contractors",
    pricePerStaff: 0,
    icon: "X",
  },
  {
    id: "yes_payroll",
    name: "Yes, Add Payroll",
    subtitle: "I have or will hire staff",
    description: "$120/yr per staff member",
    pricePerStaff: 120,
    icon: "Users",
  },
];

export const payrollFeatures = [
  "Payroll processing",
  "PAYG withholding",
  "Superannuation compliance",
  "Payment summaries",
  "Single Touch Payroll (STP) lodgement",
];

export const PAYROLL_PRICE_PER_STAFF = 120;

export const getPayrollOptionById = (id: string): PayrollOption | undefined => {
  return payrollOptions.find((p) => p.id === id);
};
