export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "date"
  | "file"
  | "signature";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[] | string[];
  helperText?: string;
}

export interface YourDetailsConfig {
  title: string;
  fields: FieldConfig[];
}

/* =========================================================
   COMMON OPTIONS
========================================================= */
export const STATES: SelectOption[] = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "WA", label: "Western Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

/* =========================================================
   ABN – SOLE TRADER
========================================================= */
const ABN: YourDetailsConfig = {
  title: "Apply ABN – Sole Trader",
  fields: [
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },

    { key: "street", label: "Street Address", type: "text", required: true },
    { key: "city", label: "City", type: "text", required: true },
    {
      key: "state",
      label: "State / Province",
      type: "select",
      options: STATES,
      required: true,
    },
    { key: "postcode", label: "Postal Code", type: "number", required: true },

    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },

    {
      key: "tfn",
      label: "TFN Number",
      type: "number",
      required: true,
      placeholder: "9 digit TFN",
    },

    {
      key: "occupation",
      label: "What will be your ABN occupation",
      type: "text",
      required: true,
      placeholder: "Uber Driver, Painter, IT Consultant",
    },

    {
      key: "gst",
      label: "Would you like to register for GST?",
      type: "radio",
      required: true,
      options: ["Yes", "No"],
      helperText:
        "GST required if turnover exceeds $75,000 or for rideshare/taxi services.",
    },

    {
      key: "idProof",
      label: "Upload Driver License or Passport",
      type: "file",
      required: true,
    },

    {
      key: "signature",
      label: "Signature",
      type: "signature",
      required: true,
    },
  ],
};

/* =========================================================
   BUSINESS NAME REGISTRATION
========================================================= */
const BUSINESS_NAME: YourDetailsConfig = {
  title: "Business Name Registration",
  fields: [
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },

    { key: "street", label: "Street Address", type: "text", required: true },
    { key: "city", label: "City", type: "text", required: true },
    {
      key: "state",
      label: "State / Province",
      type: "select",
      options: STATES,
      required: true,
    },
    { key: "postcode", label: "Postal Code", type: "number", required: true },

    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },

    {
      key: "businessStructure",
      label: "Business Structure",
      type: "select",
      required: true,
      options: [
        { value: "sole", label: "Sole Trader" },
        { value: "partnership", label: "Partnership" },
        { value: "company", label: "Company" },
        { value: "trust", label: "Trust" },
      ],
    },

    {
      key: "proposedName",
      label: "Proposed Business Name",
      type: "text",
      required: true,
    },

    {
      key: "abn",
      label: "ABN Number of Business",
      type: "number",
      required: true,
    },

    {
      key: "businessActivity",
      label: "Business Activity",
      type: "textarea",
      required: true,
      placeholder: "Cleaning, Transport, Painting",
    },

    {
      key: "idProof",
      label: "Upload Photo ID",
      type: "file",
      required: true,
    },

    {
      key: "signature",
      label: "Signature",
      type: "signature",
      required: true,
    },
  ],
};

/* =========================================================
   GST REGISTRATION
========================================================= */
const GST: YourDetailsConfig = {
  title: "GST Registration",
  fields: [
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },

    { key: "street", label: "Street Address", type: "text", required: true },
    { key: "city", label: "City", type: "text", required: true },
    {
      key: "state",
      label: "State / Province",
      type: "select",
      options: STATES,
      required: true,
    },
    { key: "postcode", label: "Postal Code", type: "number", required: true },

    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },

    { key: "abn", label: "ABN Number", type: "number", required: true },
    { key: "gstDate", label: "GST Start Date", type: "date", required: true },

    {
      key: "lodgementCycle",
      label: "Lodgement Cycle",
      type: "radio",
      required: true,
      options: ["Monthly", "Quarterly"],
    },

    {
      key: "turnover",
      label: "GST Turnover",
      type: "radio",
      required: true,
      options: [
        "$0 – $75,000",
        "$75,000 – $149,999",
        "$150,000 – $1,999,999",
        "$2m+",
      ],
    },

    {
      key: "idProof",
      label: "Upload ID Proof",
      type: "file",
      required: true,
    },

    {
      key: "signature",
      label: "Signature",
      type: "signature",
      required: true,
    },
  ],
};

/* =========================================================
   FAMILY TRUST
========================================================= */
const FAMILY_TRUST: YourDetailsConfig = {
  title: "Family Trust Registration",
  fields: [
    {
      key: "trustName",
      label: "Name of the Family Trust",
      type: "text",
      required: true,
      placeholder: "The Trustee for XYZ Family Trust",
    },
    {
      key: "trusteeCompany",
      label: "Trustee Company Name",
      type: "text",
      required: true,
    },
    { key: "email", label: "Email Address", type: "email", required: true },
    { key: "phone", label: "Phone Number", type: "phone", required: true },

    { key: "street", label: "Residential Address", type: "text", required: true },
    {
      key: "state",
      label: "State",
      type: "select",
      options: STATES,
      required: true,
    },
    { key: "postcode", label: "Postcode", type: "number", required: true },

    {
      key: "trustActivity",
      label: "Activity of Trust",
      type: "select",
      required: true,
      options: [
        { value: "investment", label: "Investment" },
        { value: "property", label: "Property" },
        { value: "business", label: "Business" },
      ],
    },

    {
      key: "beneficiaries",
      label: "Number of Trust Beneficiaries",
      type: "number",
      required: true,
    },

    {
      key: "beneficiaryIds",
      label: "Upload ID of all Beneficiaries",
      type: "file",
      required: true,
    },

    { key: "notes", label: "Notes", type: "textarea" },

    {
      key: "signature",
      label: "Signature",
      type: "signature",
      required: true,
    },
  ],
};

/* =========================================================
   SMSF
========================================================= */
const SMSF: YourDetailsConfig = {
  title: "SMSF Registration",
  fields: [
    {
      key: "smsfName",
      label: "Preferred SMSF Name",
      type: "text",
      required: true,
    },
    {
      key: "trusteeCompany",
      label: "Corporate Trustee Name",
      type: "text",
      required: true,
    },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone Number", type: "phone", required: true },

    {
      key: "membersCount",
      label: "Number of Members / Directors",
      type: "number",
      required: true,
    },

    {
      key: "memberIds",
      label: "Upload ID of all Members",
      type: "file",
      required: true,
    },

    {
      key: "declaration",
      label: "Declaration and Authority",
      type: "textarea",
      required: true,
    },

    {
      key: "signature",
      label: "Signature",
      type: "signature",
      required: true,
    },
  ],
};

/* =========================================================
   UNIT TRUST
========================================================= */
const UNIT_TRUST: YourDetailsConfig = {
  title: "Unit Trust Registration",
  fields: [
    { key: "unitTrustName", label: "Name of Unit Trust", type: "text", required: true },
    { key: "trusteeCompany", label: "Corporate Trustee", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "tfn", label: "TFN Number", type: "number", required: true },
    { key: "idProof", label: "Upload ID Proof", type: "file", required: true },
    { key: "trustActivity", label: "Activity of Trust", type: "text", required: true },
    { key: "unitHolders", label: "Number of Unit Holders", type: "number", required: true },
    { key: "signature", label: "Signature", type: "signature", required: true },
  ],
};

/* =========================================================
   PARTNERSHIP
========================================================= */
const PARTNERSHIP: YourDetailsConfig = {
  title: "Partnership Registration",
  fields: [
    { key: "officeholder", label: "Full Name of Officeholder", type: "text", required: true },
    { key: "businessAddress", label: "Business Address", type: "text", required: true },
    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "startDate", label: "Start Date of Partnership", type: "date", required: true },
    { key: "businessName", label: "Business Name", type: "text", required: true },
    { key: "businessActivity", label: "Business Activity", type: "textarea", required: true },
    { key: "partnersCount", label: "Number of Partners", type: "number", required: true },
    { key: "signature", label: "Signature", type: "signature", required: true },
  ],
};

/* =========================================================
   TFN
========================================================= */
const TFN: YourDetailsConfig = {
  title: "Online TFN Registration",
  fields: [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "address", label: "Address", type: "text", required: true },
    { key: "phone", label: "Phone Number", type: "phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    {
      key: "spouse",
      label: "Do you have a spouse?",
      type: "radio",
      options: ["Yes", "No"],
    },
    { key: "passport", label: "Upload Passport", type: "file", required: true },
    { key: "signature", label: "Signature", type: "signature", required: true },
  ],
};

/* =========================================================
   EXPORT MAP
========================================================= */
export const YOUR_DETAILS_FORMS: Record<string, YourDetailsConfig> = {
  abn: ABN,
  business_name: BUSINESS_NAME,
  gst: GST,
  family_trust: FAMILY_TRUST,
  smsf: SMSF,
  unit_trust: UNIT_TRUST,
  partnership: PARTNERSHIP,
  tfn: TFN,
};
