/**
 * Generic utility to download calculator results as a .txt file.
 */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");
const now = () => new Date().toLocaleDateString("en-AU");

/* ── Business Tax Planning ── */
export function downloadTaxPlanningEstimate(data: {
  entity: string;
  revenue: number;
  taxRate: number;
  annualSavings: number;
  threeYearSavings: number;
  roi: number;
  planningInvestment: number;
}) {
  const entityLabel =
    data.entity === "company" ? "Company" : data.entity === "trust" ? "Trust" : "Sole Trader";
  const currentTax = data.revenue * (data.taxRate / 100);
  const paybackMonths = data.annualSavings > 0 ? +((data.planningInvestment / data.annualSavings) * 12).toFixed(1) : 0;

  const content = `TAX PLANNING ESTIMATE
Generated: ${now()}

YOUR DETAILS:
- Entity Type: ${entityLabel}
- Annual Revenue: ${fmt(data.revenue)}
- Current Tax Rate: ${data.taxRate}%
- Current Tax Payable: ${fmt(Math.round(currentTax))}

POTENTIAL SAVINGS:
- Annual Tax Savings: ${fmt(data.annualSavings)}
- Percentage Reduction: ${((data.annualSavings / currentTax) * 100).toFixed(1)}%
- 3-Year Savings: ${fmt(data.threeYearSavings)}
- ROI on Planning: ${data.roi}%

RECOMMENDED STRATEGIES:
- Consider company or trust structure
- Deduction maximization review
- Timing & deferral strategies
- Superannuation optimization
- CGT planning (if applicable)

INVESTMENT VS RETURN:
- Planning Fee: ${fmt(data.planningInvestment)}
- Annual Savings: ${fmt(data.annualSavings)}
- ROI: ${data.roi}%
- Payback Period: ${paybackMonths} months

NEXT STEPS:
1. Book free strategy session with Nanak Accountants
2. Receive detailed tax optimization plan
3. Implement strategies before EOFY
4. Start saving immediately

Contact: 1300 626 257
Website: nanakaccountants.com.au

Note: These are conservative estimates. Actual savings may be higher based on your specific circumstances and our comprehensive review. All strategies are 100% ATO-compliant.
`;

  downloadTextFile(`tax-planning-estimate-${Date.now()}.txt`, content);
}

/* ── Business Valuation ── */
export function downloadValuationEstimate(data: {
  industry: string;
  revenue: number;
  ebitda: number;
  valuation: number;
  low: number;
  high: number;
  profitMargin: number;
  healthScore: number;
}) {
  const industryLabel =
    data.industry === "services" ? "Services" :
    data.industry === "retail" ? "Retail" :
    data.industry === "manufacturing" ? "Manufacturing" : "Tech/SaaS";

  const content = `BUSINESS VALUATION ESTIMATE
Generated: ${now()}

YOUR DETAILS:
- Industry: ${industryLabel}
- Annual Revenue: ${fmt(data.revenue)}
- Annual Net Profit (EBITDA): ${fmt(data.ebitda)}

VALUATION RESULTS:
- Estimated Valuation: ${fmt(data.valuation)}
- Valuation Range: ${fmt(data.low)} – ${fmt(data.high)}
- Profit Margin: ${data.profitMargin.toFixed(1)}%
- Business Health Score: ${data.healthScore}/100

WHAT'S INCLUDED IN PROFESSIONAL VALUATION:
- Independent expert valuation report
- Court-accepted methodology
- Multiple valuation approaches
- Detailed financial analysis
- Professional presentation

NEXT STEPS:
1. Book free strategy session with Nanak Accountants
2. Receive comprehensive valuation report
3. Use for sale, acquisition, or strategic planning

Contact: 1300 626 257
Website: nanakaccountants.com.au

Note: This is an indicative estimate only. Actual valuation depends on comprehensive analysis. Business valuations typically use 3-7x EBITDA multiples and vary by sector, location, and business specifics.
`;

  downloadTextFile(`business-valuation-estimate-${Date.now()}.txt`, content);
}

/* ── Buying a Business ── */
export function downloadBuyingEstimate(data: {
  structure: string;
  price: number;
  revenue: number;
  ebitda: number;
  profitMultiple: number;
  annualROI: number;
  paybackYears: number;
  stampDuty: number;
  dueDiligence: number;
  totalInvestment: number;
}) {
  const structureLabel = data.structure === "asset" ? "Asset Purchase" : "Share Purchase";

  const content = `BUYING A BUSINESS ESTIMATE
Generated: ${now()}

YOUR DETAILS:
- Purchase Structure: ${structureLabel}
- Purchase Price: ${fmt(data.price)}
- Annual Revenue: ${fmt(data.revenue)}
- Annual Profit (EBITDA): ${fmt(data.ebitda)}

VALUATION METRICS:
- Profit Multiple: ${data.profitMultiple}x (Industry avg: 2-4x)
- Annual ROI: ${data.annualROI}%
- Payback Period: ${data.paybackYears} years

COST BREAKDOWN:
- Purchase Price: ${fmt(data.price)}
- Due Diligence Cost: ${fmt(data.dueDiligence)}${data.stampDuty > 0 ? `\n- Stamp Duty: ${fmt(data.stampDuty)} (Share purchase only)` : ""}
- Total Investment: ${fmt(data.totalInvestment)}

NEXT STEPS:
1. Book free strategy session with Nanak Accountants
2. Conduct comprehensive due diligence
3. Finalise acquisition structure
4. Secure financing and complete purchase

Contact: 1300 626 257
Website: nanakaccountants.com.au

Note: These calculations provide indicative estimates only. Actual valuation and costs depend on comprehensive due diligence. Always conduct professional due diligence before committing to any acquisition.
`;

  downloadTextFile(`buying-business-estimate-${Date.now()}.txt`, content);
}
