

## Plan: Add Company-Specific Fields for Company-Type Shareholders

### Problem
When a shareholder selects "Company" type in the Company Registration flow, the form still shows individual-oriented fields (Full Name, Residential Address, Email, Phone). It's missing the company-specific fields that the Unit Trust flow already has: **Company Name, ACN, Contact Email, and Contact Phone**.

### Changes

**File: `src/components/checkout/company/CRStepShareholders.tsx`**

1. **Update the `Shareholder` interface** to add company-specific fields:
   - `companyName` (string, optional)
   - `acn` (string, optional)
   - `contactEmail` (string, optional)
   - `contactPhone` (string, optional)

2. **Split the form fields by shareholder type** -- instead of always showing Full Name / Address / Email / Phone:
   - **Individual type**: Show Full Name, DOB, TFN, Residential Address, Email, Phone (current behavior, unchanged)
   - **Company type**: Show Company Name, ACN, Residential Address (as registered address), Contact Email, Contact Phone (matching Unit Trust pattern)

3. **Update validation** in the `validate()` function:
   - For "company" type: validate `companyName` (required), `acn` (required, using existing `validateACN`), `contactEmail` (required), and skip DOB/TFN
   - For "individual" type: keep current validation unchanged

4. **Import `validateACN`** from `@/utils/validation` (already importing `validateEmail` and `validateTFN`)

### What stays the same
- All existing Company Secretary and Public Officer logic remains untouched
- Share allocation, counters, and share class selection unchanged
- The type toggle buttons (Individual / Company) stay as-is
- Number of Shares and Share Class fields remain for both types
