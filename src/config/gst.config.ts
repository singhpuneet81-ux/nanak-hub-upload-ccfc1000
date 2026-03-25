// GST Configuration for Australia
// This file allows easy modification of GST-related settings

export const gstConfig = {
  // Standard GST rate in Australia
  rate: 0.10, // 10%
  
  // Display name
  displayName: "GST",
  
  // Full name
  fullName: "Goods and Services Tax",
  
  // Items that are GST-free
  gstFreeItems: [
    "asic_fees",
    "government_fees",
  ],
  
  // Whether to show GST breakdown
  showBreakdown: true,
  
  // Note about GST-free items
  gstFreeNote: "* ASIC government fees are GST-free",
};

export const isGstFree = (itemType: string): boolean => {
  return gstConfig.gstFreeItems.includes(itemType);
};

export const getGstRate = (): number => {
  return gstConfig.rate;
};

export const getGstPercentage = (): string => {
  return `${gstConfig.rate * 100}%`;
};
