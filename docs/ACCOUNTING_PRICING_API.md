# Accounting Services — Dynamic Pricing API

> Backend specification for managing pricing across Company Accounting, Trust Accounting, NFP Accounting, and Partnership Tax from the admin panel.

---

## Architecture

```
Frontend (React)
    │
    ├── Fetches from: GET /api/admin/accounting-pricing
    ├── Fallback: src/config/accountingPricingFallback.json
    │
Backend (Node/Express + MongoDB)
    │
    ├── Model:      accounting-pricing.model.js
    ├── Controller:  accounting-pricing.controller.js
    ├── Routes:      accounting-pricing.routes.js
    └── Seeder:      accounting-pricing-seeder.json
```

---

## Database Schema (MongoDB)

### Collection: `accounting_pricing`

Each document represents one service category's complete pricing configuration.

```json
{
  "_id": "ObjectId",
  "serviceKey": "company_accounting",
  "label": "Company Accounting",
  "tiers": {
    "under75k":    { "compliance": 1200, "monthly": 100 },
    "75to200k":    { "compliance": 1400, "monthly": 120 },
    "200to500k":   { "compliance": 1600, "monthly": 140 },
    "500to1m":     { "compliance": 1800, "monthly": 160 },
    "1mto2m":      { "compliance": 2000, "monthly": 180 },
    "2mto5m":      { "compliance": 2500, "monthly": 200 }
  },
  "revenueTiers": [
    { "id": "under75k", "label": "Under $75K" },
    { "id": "75to200k", "label": "$75K – $200K" },
    { "id": "200to500k", "label": "$200K – $500K" },
    { "id": "500to1m", "label": "$500K – $1M" },
    { "id": "1mto2m", "label": "$1M – $2M" },
    { "id": "2mto5m", "label": "$2M – $5M" }
  ],
  "annualDiscount": 0.20,
  "transitionFee": 600,
  "startDates": [
    { "id": "jul", "label": "1 July 2025", "months": 12, "desc": "Full Year" },
    { "id": "oct", "label": "1 October 2025", "months": 9, "desc": "9 months" },
    { "id": "jan", "label": "1 January 2026", "months": 6, "desc": "6 months" },
    { "id": "apr", "label": "1 April 2026", "months": 3, "desc": "3 months" }
  ],
  "addons": {
    "catchUpFee": 750,
    "registeredOfficeFee": 300,
    "taxPlanningFee": 500,
    "payrollPerEmployee": 120
  },
  "plans": {
    "essential": {
      "title": "Essential",
      "subtitle": "Compliance-focused",
      "features": ["Monthly Bookkeeping", "Quarterly BAS Lodgement", "Annual Tax Return", "Annual Financial Statements", "ASIC Annual Review"],
      "extraFeatures": ["Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement"]
    },
    "premium": {
      "title": "Premium",
      "subtitle": "Strategic growth",
      "badge": "MOST POPULAR",
      "features": ["Everything in Essential", "Tax Planning Sessions", "Priority Phone Support", "Monthly Management Reports", "Quarterly Strategy Meetings", "Dedicated Accountant"],
      "extraFeatures": ["ASIC Annual Review", "Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Annual Financial Statements", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement", "Cloud Accounting Software Setup", "Quarterly Review Meetings", "Strategic Tax Advisory"]
    }
  },
  "updatedAt": "2026-02-28T00:00:00.000Z",
  "createdAt": "2026-02-28T00:00:00.000Z"
}
```

---

## API Endpoints

### `GET /api/admin/accounting-pricing`

**Auth:** None (public — used by frontend checkout)

Returns all 4 service pricing configs.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "serviceKey": "company_accounting", ... },
    { "serviceKey": "trust_accounting", ... },
    { "serviceKey": "nfp_accounting", ... },
    { "serviceKey": "partnership_tax", ... }
  ]
}
```

### `GET /api/admin/accounting-pricing/:serviceKey`

Returns a single service pricing config.

### `PUT /api/admin/accounting-pricing/:serviceKey`

**Auth:** Admin only (JWT required)

Updates pricing for a specific service.

**Request Body:** Full or partial pricing config object.

### `POST /api/admin/accounting-pricing/seed`

**Auth:** Admin only

Seeds/resets all 4 services from the seeder JSON.

---
