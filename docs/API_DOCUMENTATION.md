# Nanak Accounts — Backend API Documentation

> Complete API specification for all checkout form submissions, Stripe payment integration, admin panel, and role-based management.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Authentication & Roles](#3-authentication--roles)
4. [API Endpoints](#4-api-endpoints)
   - [4.1 Checkout Submission](#41-post-apicheckoutsubmit)
   - [4.2 Create Stripe Checkout Session](#42-post-apicreate-checkout-session)
   - [4.3 Stripe Webhook](#43-post-apistripe-webhook)
   - [4.4 Submissions CRUD](#44-submissions-crud)
   - [4.5 Assignments](#45-assignments)
   - [4.6 Team / User Management](#46-team--user-management)
   - [4.7 Activity Log](#47-activity-log)
   - [4.8 Dashboard Stats](#48-dashboard-stats)
5. [Payload Schemas per Service](#5-payload-schemas-per-service)
6. [Stripe Integration Flow](#6-stripe-integration-flow)
7. [Frontend Integration Guide](#7-frontend-integration-guide)
8. [Error Handling](#8-error-handling)

---

## 1. Architecture Overview

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────┐
│   Frontend      │──────▶│   Backend API        │──────▶│  Database   │
│   (React SPA)   │       │   (Express/Deno/etc) │       │  (Postgres) │
└─────────────────┘       └──────────┬───────────┘       └─────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   Stripe    │
                              │   API       │
                              └─────────────┘
```

### Flow Summary

1. User fills out a service form (ABN, GST, Company, etc.)
2. User clicks "Proceed to Payment" on the Review step
3. Frontend sends form data to `POST /api/checkout/submit`
4. Backend creates a `submission` record (status: `pending_payment`)
5. Backend calls Stripe to create a Checkout Session with the total price
6. Backend returns the Stripe Checkout URL to the frontend
7. Frontend redirects user to Stripe Checkout
8. On payment success, Stripe sends webhook to `POST /api/stripe-webhook`
9. Backend updates submission status to `payment_complete`
10. Admin sees the submission in the dashboard

---

## 2. Database Schema

### 2.1 `submissions` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated |
| `service_key` | `varchar(50)` | Service identifier (see list below) |
| `service_display_name` | `varchar(100)` | Human-readable service name |
| `customer_data` | `jsonb` | All form fields submitted by user |
| `selections` | `jsonb` | Package type, add-ons, accounting package |
| `pricing` | `jsonb` | `{ subtotal, gst, total }` |
| `payment_status` | `enum` | `pending_payment`, `payment_complete`, `payment_failed`, `refunded` |
| `stripe_checkout_session_id` | `varchar(255)` | Stripe Checkout Session ID |
| `stripe_payment_intent_id` | `varchar(255)` | Stripe Payment Intent ID (from webhook) |
| `workflow_status` | `enum` | `new`, `assigned`, `in_progress`, `contacted`, `completed`, `cancelled` |
| `assigned_to` | `uuid` (FK → profiles.id) | Staff member assigned |
| `notes` | `text` | Internal notes |
| `created_at` | `timestamptz` | Submission timestamp |
| `updated_at` | `timestamptz` | Last modified |

**Valid `service_key` values:**

| Key | Display Name | Route |
|---|---|---|
| `abn` | ABN Registration | `/pricing?service=abn` |
| `business_name` | Business Name Registration | `/pricing?service=business_name` |
| `family_trust` | Family Trust Setup | `/pricing?service=family_trust` |
| `gst` | GST Registration | `/pricing?service=gst` |
| `charity` | Charity Setup | `/pricing?service=charity` |
| `charity_clg` | Company Limited by Guarantee | `/pricing?service=charity&structure=clg` |
| `charity_ia` | Incorporated Association | `/pricing?service=charity&structure=ia` |
| `company` | Company Registration | `/pricing?service=company` |
| `smsf` | SMSF Setup | `/pricing?service=smsf` |
| `unit_trust` | Unit Trust Setup | `/pricing?service=unit_trust` |
| `bare_trust` | Bare Trust Setup | `/pricing?service=bare_trust` |
| `partnership` | Partnership Registration | `/pricing?service=partnership` |
| `tfn` | TFN Registration | `/tfn-registration` |
| `ndis` | NDIS Business Setup | `/ndis-business-setup` |
| `dgr` | DGR Registration | `/dgr-registration` |
| `company_accounting` | Company Accounting | `/pricing?service=company_accounting` |
| `trust_accounting` | Trust Accounting | `/pricing?service=trust_accounting` |
| `nfp_accounting` | NFP Accounting | `/pricing?service=nfp_accounting` |
| `smsf_accounting` | SMSF Accounting | `/pricing?service=smsf_accounting` |
| `partnership_tax` | Partnership Tax | `/pricing?service=partnership_tax` |
| `asic_agent` | ASIC Agent Services | `/pricing?service=asic_agent` |

### 2.2 `profiles` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK, FK → auth.users.id) | User ID |
| `full_name` | `varchar(100)` | Display name |
| `email` | `varchar(255)` | Email |
| `avatar_url` | `text` | Profile picture URL |
| `created_at` | `timestamptz` | Account creation |

### 2.3 `user_roles` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated |
| `user_id` | `uuid` (FK → auth.users.id) | User reference |
| `role` | `enum('admin','manager','staff')` | Role type |
| **Unique constraint** | `(user_id, role)` | One role per type per user |

### 2.4 `assignments` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated |
| `submission_id` | `uuid` (FK → submissions.id) | The submission |
| `assigned_to` | `uuid` (FK → profiles.id) | Staff member |
| `assigned_by` | `uuid` (FK → profiles.id) | Admin/manager who assigned |
| `assigned_at` | `timestamptz` | When assigned |
| `notes` | `text` | Assignment notes |

### 2.5 `activity_log` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Auto-generated |
| `submission_id` | `uuid` (FK → submissions.id) | Related submission |
| `actor_id` | `uuid` (FK → profiles.id) | Who performed action |
| `action` | `varchar(50)` | Action type (see below) |
| `details` | `jsonb` | Additional context |
| `created_at` | `timestamptz` | When it happened |

**Action types:** `created`, `payment_received`, `payment_failed`, `assigned`, `status_changed`, `note_added`, `reassigned`

### SQL Creation Script

```sql
-- Enums
CREATE TYPE payment_status AS ENUM ('pending_payment', 'payment_complete', 'payment_failed', 'refunded');
CREATE TYPE workflow_status AS ENUM ('new', 'assigned', 'in_progress', 'contacted', 'completed', 'cancelled');
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'staff');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles (separate table — never store roles on profiles!)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key VARCHAR(50) NOT NULL,
  service_display_name VARCHAR(100) NOT NULL,
  customer_data JSONB NOT NULL DEFAULT '{}',
  selections JSONB NOT NULL DEFAULT '{}',
  pricing JSONB NOT NULL DEFAULT '{"subtotal":0,"gst":0,"total":0}',
  payment_status payment_status NOT NULL DEFAULT 'pending_payment',
  stripe_checkout_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  workflow_status workflow_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES profiles(id) NOT NULL,
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-check function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and managers can view all submissions"
  ON submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can view assigned submissions"
  ON submissions FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Anyone can insert submissions"
  ON submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and managers can update submissions"
  ON submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can update own assigned submissions"
  ON submissions FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'staff'));
```

---

## 3. Authentication & Roles

### Role Permissions Matrix

| Action | Admin | Manager | Staff |
|---|---|---|---|
| View all submissions | ✅ | ✅ | ❌ (only assigned) |
| Assign submissions | ✅ | ✅ | ❌ |
| Change workflow status | ✅ | ✅ | ✅ (own only) |
| Manage users & roles | ✅ | ❌ | ❌ |
| View reports/analytics | ✅ | ✅ | ❌ |
| Add notes | ✅ | ✅ | ✅ (own only) |

### Auth Headers

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## 4. API Endpoints

### 4.1 `POST /api/checkout/submit`

**Auth:** None required (public — customers submit this)

**Description:** Receives form submission + creates Stripe Checkout Session. Returns Stripe URL for redirect.

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**

| Field | Type | Description |
|---|---|---|
| `payload` | `string` (JSON) | Stringified JSON with all form data (see below) |
| `customer.*` | `File` | Any uploaded files, keyed by their dot-path |

**Payload JSON structure:**
```json
{
  "serviceKey": "abn",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "customer": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "0400000000",
    "...": "...service-specific fields"
  },
  "selections": {
    "packageType": "registration_only",
    "accountingPackage": null,
    "addOns": ["tax_consultation"],
    "structure": "sole_trader"
  },
  "pricing": {
    "subtotal": 499,
    "gst": 49.9,
    "total": 548.9
  },
  "meta": {
    "directors": [...],
    "shareholders": [...]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "submissionId": "uuid-here",
  "stripeCheckoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "stripeSessionId": "cs_test_..."
}
```

**Backend Logic:**
```
1. Parse FormData → extract payload JSON + files
2. Validate required fields (serviceKey, customer.email, pricing)
3. INSERT into submissions table (payment_status = 'pending_payment')
4. Upload files to storage (S3/GCS/local) if any
5. Create Stripe Checkout Session:
   - line_items: [{ price_data: { currency: 'aud', unit_amount: pricing.total * 100, product_data: { name: serviceDisplayName } }, quantity: 1 }]
   - mode: 'payment'
   - success_url: origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}'
   - cancel_url: origin + '/payment-cancelled?submission_id=' + submissionId
   - metadata: { submission_id: submissionId, service_key: serviceKey }
   - customer_email: customer.email
6. UPDATE submission with stripe_checkout_session_id
7. INSERT activity_log (action: 'created')
8. Return { submissionId, stripeCheckoutUrl }
```

---

### 4.2 `POST /api/create-checkout-session`

**Auth:** None (alternative lightweight endpoint if you separate form save from payment)

**Description:** Creates a Stripe Checkout Session for an existing submission.

**Request:**
```json
{
  "submissionId": "uuid",
  "amount": 548.9,
  "currency": "aud",
  "serviceName": "ABN Registration",
  "customerEmail": "john@example.com"
}
```

**Response (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Stripe Session Config:**
```javascript
const session = await stripe.checkout.sessions.create({
  customer_email: customerEmail,
  line_items: [{
    price_data: {
      currency: 'aud',
      unit_amount: Math.round(amount * 100), // Convert to cents
      product_data: {
        name: serviceName,
        description: `Nanak Accounts - ${serviceName}`,
      },
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/payment-cancelled?submission_id=${submissionId}`,
  metadata: {
    submission_id: submissionId,
  },
});
```

---

### 4.3 `POST /api/stripe-webhook`

**Auth:** Stripe signature verification (no JWT)

**Description:** Handles Stripe webhook events to update payment status.

**Events to handle:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Update submission `payment_status` → `payment_complete`, store `payment_intent_id` |
| `checkout.session.expired` | Update `payment_status` → `payment_failed` |
| `charge.refunded` | Update `payment_status` → `refunded` |

**Webhook Handler Logic:**
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);

switch (event.type) {
  case 'checkout.session.completed': {
    const session = event.data.object;
    const submissionId = session.metadata.submission_id;

    await db.submissions.update({
      where: { id: submissionId },
      data: {
        payment_status: 'payment_complete',
        stripe_payment_intent_id: session.payment_intent,
      },
    });

    await db.activity_log.insert({
      submission_id: submissionId,
      action: 'payment_received',
      details: {
        amount: session.amount_total / 100,
        currency: session.currency,
        payment_intent: session.payment_intent,
      },
    });
    break;
  }

  case 'checkout.session.expired': {
    const session = event.data.object;
    const submissionId = session.metadata.submission_id;
    await db.submissions.update({
      where: { id: submissionId },
      data: { payment_status: 'payment_failed' },
    });
    await db.activity_log.insert({
      submission_id: submissionId,
      action: 'payment_failed',
      details: { reason: 'Session expired' },
    });
    break;
  }
}
```

---

### 4.4 Submissions CRUD

#### `GET /api/admin/submissions`

**Auth:** Admin, Manager (all), Staff (only assigned)

**Query Params:**

| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Per page (default: 20, max: 100) |
| `service_key` | `string` | Filter by service |
| `payment_status` | `string` | Filter by payment status |
| `workflow_status` | `string` | Filter by workflow status |
| `assigned_to` | `uuid` | Filter by assignee |
| `search` | `string` | Search customer name/email |
| `date_from` | `ISO date` | Created after |
| `date_to` | `ISO date` | Created before |
| `sort_by` | `string` | Column to sort (default: `created_at`) |
| `sort_order` | `asc\|desc` | Sort direction (default: `desc`) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "service_key": "abn",
      "service_display_name": "ABN Registration",
      "customer_data": {
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com",
        "phone": "0400000000"
      },
      "selections": { "packageType": "registration_only" },
      "pricing": { "subtotal": 499, "gst": 49.9, "total": 548.9 },
      "payment_status": "payment_complete",
      "workflow_status": "new",
      "assigned_to": null,
      "created_at": "2026-02-11T10:30:00Z",
      "updated_at": "2026-02-11T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### `GET /api/admin/submissions/:id`

**Auth:** Admin, Manager, or assigned Staff

**Response (200):**
```json
{
  "id": "uuid",
  "service_key": "company",
  "service_display_name": "Company Registration",
  "customer_data": { "...full form data..." },
  "selections": { "...all selections..." },
  "pricing": { "subtotal": 899, "gst": 89.9, "total": 988.9 },
  "payment_status": "payment_complete",
  "stripe_checkout_session_id": "cs_test_...",
  "stripe_payment_intent_id": "pi_...",
  "workflow_status": "assigned",
  "assigned_to": {
    "id": "uuid",
    "full_name": "Staff Member",
    "email": "staff@nanakaccounts.com"
  },
  "notes": "Client needs urgent processing",
  "files": [
    { "field": "customer.idProof", "fileName": "passport.pdf", "url": "https://..." }
  ],
  "activity": [
    { "action": "created", "actor": "System", "created_at": "..." },
    { "action": "payment_received", "details": { "amount": 988.9 }, "created_at": "..." },
    { "action": "assigned", "actor": "Admin User", "details": { "assigned_to": "Staff Member" }, "created_at": "..." }
  ],
  "created_at": "2026-02-11T10:30:00Z"
}
```

#### `PATCH /api/admin/submissions/:id`

**Auth:** Admin, Manager, or assigned Staff (limited fields)

**Request:**
```json
{
  "workflow_status": "in_progress",
  "notes": "Contacted client, awaiting documents"
}
```

**Updatable fields:**

| Field | Admin | Manager | Staff |
|---|---|---|---|
| `workflow_status` | ✅ | ✅ | ✅ (own) |
| `notes` | ✅ | ✅ | ✅ (own) |
| `assigned_to` | ✅ | ✅ | ❌ |
| `payment_status` | ✅ | ❌ | ❌ |

---

### 4.5 Assignments

#### `POST /api/admin/assignments`

**Auth:** Admin, Manager only

**Request:**
```json
{
  "submissionId": "uuid",
  "assignedTo": "uuid (staff user id)",
  "notes": "Please contact client ASAP"
}
```

**Backend Logic:**
```
1. Validate submissionId exists
2. Validate assignedTo user has 'staff' or 'manager' role
3. INSERT into assignments table
4. UPDATE submissions.assigned_to = assignedTo
5. UPDATE submissions.workflow_status = 'assigned'
6. INSERT activity_log (action: 'assigned')
7. (Optional) Send notification email to assignee
```

**Response (200):**
```json
{
  "success": true,
  "assignment": {
    "id": "uuid",
    "submission_id": "uuid",
    "assigned_to": "uuid",
    "assigned_by": "uuid",
    "assigned_at": "2026-02-11T11:00:00Z"
  }
}
```

#### `PUT /api/admin/assignments/:id/reassign`

**Auth:** Admin, Manager only

**Request:**
```json
{
  "newAssignee": "uuid",
  "reason": "Previous assignee on leave"
}
```

---

### 4.6 Team / User Management

#### `GET /api/admin/team`

**Auth:** Admin only

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Jane Admin",
      "email": "jane@nanakaccounts.com",
      "roles": ["admin"],
      "active_assignments": 0,
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "full_name": "Bob Staff",
      "email": "bob@nanakaccounts.com",
      "roles": ["staff"],
      "active_assignments": 5,
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

#### `POST /api/admin/team/roles`

**Auth:** Admin only

**Request:**
```json
{
  "userId": "uuid",
  "role": "manager"
}
```

#### `DELETE /api/admin/team/roles`

**Auth:** Admin only

**Request:**
```json
{
  "userId": "uuid",
  "role": "manager"
}
```

---

### 4.7 Activity Log

#### `GET /api/admin/activity`

**Auth:** Admin, Manager

**Query Params:** `submission_id`, `actor_id`, `action`, `date_from`, `date_to`, `page`, `limit`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "submission_id": "uuid",
      "actor": { "id": "uuid", "full_name": "Admin User" },
      "action": "assigned",
      "details": { "assigned_to": "Staff Name", "notes": "Urgent" },
      "created_at": "2026-02-11T11:00:00Z"
    }
  ]
}
```

---

### 4.8 Dashboard Stats

#### `GET /api/admin/dashboard/stats`

**Auth:** Admin, Manager

**Response (200):**
```json
{
  "overview": {
    "total_submissions": 1542,
    "pending_payment": 23,
    "payment_complete": 1480,
    "payment_failed": 39,
    "active_in_progress": 67,
    "completed_this_month": 189
  },
  "by_service": [
    { "service_key": "abn", "display_name": "ABN Registration", "count": 342, "revenue": 167958 },
    { "service_key": "company", "display_name": "Company Registration", "count": 210, "revenue": 207690 },
    { "service_key": "gst", "display_name": "GST Registration", "count": 198, "revenue": 21582 }
  ],
  "recent_submissions": [
    {
      "id": "uuid",
      "service_display_name": "ABN Registration",
      "customer_name": "John Smith",
      "payment_status": "payment_complete",
      "created_at": "2026-02-11T10:30:00Z"
    }
  ],
  "team_workload": [
    { "user_id": "uuid", "full_name": "Bob Staff", "active": 5, "completed_this_week": 12 }
  ]
}
```

---

## 5. Payload Schemas per Service

### 5.1 ABN Registration (`service_key: "abn"`)

```json
{
  "customer": {
    "firstName": "string (required)",
    "lastName": "string (required)",
    "email": "string (required)",
    "phone": "string (required)",
    "dateOfBirth": "string (YYYY-MM-DD)",
    "taxFileNumber": "string",
    "businessStructure": "sole_trader | partnership | company | trust",
    "businessDescription": "string",
    "businessStartDate": "string (YYYY-MM-DD)",
    "businessAddress": {
      "street": "string",
      "suburb": "string",
      "state": "string (NSW|VIC|QLD|SA|WA|TAS|NT|ACT)",
      "postcode": "string"
    }
  },
  "selections": {
    "packageType": "registration_only | registration_and_accounting",
    "accountingPackage": "string | null",
    "addOns": ["string"]
  },
  "pricing": {
    "subtotal": "number",
    "gst": "number",
    "total": "number"
  }
}
```

### 5.2 Business Name (`service_key: "business_name"`)

```json
{
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "proposedBusinessName": "string (required)",
    "registrationTerm": "1_year | 3_years",
    "abnNumber": "string",
    "businessAddress": { "street": "", "suburb": "", "state": "", "postcode": "" }
  },
  "selections": {
    "registrationTerm": "1_year | 3_years",
    "packageType": "string",
    "addOns": ["payroll_setup", "..."]
  }
}
```

### 5.3 GST Registration (`service_key: "gst"`)

```json
{
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "abnNumber": "string (required)",
    "entityName": "string",
    "estimatedTurnover": "string",
    "gstStartDate": "string",
    "accountingMethod": "cash | accrual",
    "reportingPeriod": "monthly | quarterly | annually"
  },
  "selections": {
    "packageType": "string"
  }
}
```

### 5.4 Family Trust (`service_key: "family_trust"`)

```json
{
  "customer": {
    "trustName": "string (required)",
    "trusteeType": "individual | corporate",
    "appointor": { "firstName": "", "lastName": "" },
    "beneficiaries": [{ "firstName": "", "lastName": "", "relationship": "" }],
    "trusteeDetails": {
      "individual": { "firstName": "", "lastName": "", "dateOfBirth": "" },
      "corporate": { "companyName": "", "acn": "" }
    },
    "settlor": { "firstName": "", "lastName": "" },
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "selections": {
    "packageType": "string",
    "addOns": []
  }
}
```

### 5.5 Company Registration (`service_key: "company"`)

```json
{
  "customer": {
    "companyName": "string (required)",
    "companyType": "proprietary_limited | public",
    "registeredAddress": { "street": "", "suburb": "", "state": "", "postcode": "" },
    "directors": [
      { "firstName": "", "lastName": "", "dateOfBirth": "", "residentialAddress": {} }
    ],
    "shareholders": [
      { "name": "", "sharesHeld": "number", "shareClass": "ordinary" }
    ],
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "selections": {
    "packageType": "string",
    "addOns": []
  }
}
```

### 5.6 SMSF (`service_key: "smsf"`)

```json
{
  "customer": {
    "fundName": "string (required)",
    "trusteeStructure": "individual | corporate",
    "members": [
      { "firstName": "", "lastName": "", "dateOfBirth": "", "tfn": "", "isTrustee": true }
    ],
    "corporateTrustee": { "companyName": "", "acn": "" },
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "selections": {
    "packageType": "string",
    "addOns": []
  }
}
```

### 5.7 Unit Trust (`service_key: "unit_trust"`)

```json
{
  "customer": {
    "trustName": "string (required)",
    "trusteeType": "individual | corporate",
    "unitholders": [
      { "name": "", "units": "number", "unitClass": "ordinary" }
    ],
    "trusteeDetails": {},
    "contactEmail": "string",
    "contactPhone": "string"
  }
}
```

### 5.8 Bare Trust (`service_key: "bare_trust"`)

```json
{
  "customer": {
    "smsfDetails": { "fundName": "", "abn": "" },
    "trusteeDetails": { "name": "", "type": "individual | corporate" },
    "propertyDetails": {
      "address": { "street": "", "suburb": "", "state": "", "postcode": "" },
      "propertyType": "residential | commercial",
      "purchasePrice": "number"
    },
    "loanDetails": { "lender": "", "loanAmount": "number" },
    "contactEmail": "string",
    "contactPhone": "string"
  }
}
```

### 5.9 Partnership (`service_key: "partnership"`)

```json
{
  "customer": {
    "partnershipName": "string (required)",
    "partnershipType": "general | limited",
    "partners": [
      { "firstName": "", "lastName": "", "email": "", "ownership": "number (%)" }
    ],
    "contactEmail": "string",
    "contactPhone": "string",
    "taxSetup": { "gstRequired": true, "payrollRequired": false }
  },
  "selections": {
    "packageType": "string",
    "addOns": []
  }
}
```

### 5.10 Charity — CLG (`service_key: "charity_clg"`)

```json
{
  "customer": {
    "companyName": "string (required)",
    "charitySubtype": "advancing_health | advancing_education | ...",
    "directors": [{ "firstName": "", "lastName": "" }],
    "members": [{ "firstName": "", "lastName": "" }],
    "guaranteeAmount": "number (per member)",
    "registeredAddress": {},
    "contactEmail": "string"
  }
}
```

### 5.11 Charity — IA (`service_key: "charity_ia"`)

```json
{
  "customer": {
    "associationName": "string (required)",
    "charitySubtype": "string",
    "registrationState": "VIC | NSW | QLD | ...",
    "committeeMembers": [{ "firstName": "", "lastName": "", "position": "" }],
    "contactEmail": "string"
  }
}
```

### 5.12 TFN Registration (`service_key: "tfn"`)

```json
{
  "customer": {
    "firstName": "string (required)",
    "lastName": "string (required)",
    "email": "string (required)",
    "phone": "string",
    "entityType": "individual | company | trust | partnership",
    "additionalNotes": "string"
  },
  "pricing": { "subtotal": 0, "gst": 0, "total": 0 }
}
```

### 5.13 NDIS (`service_key: "ndis"`)

```json
{
  "customer": {
    "firstName": "string (required)",
    "lastName": "string (required)",
    "email": "string (required)",
    "phone": "string",
    "businessName": "string",
    "ndisRegistrationGroup": "string",
    "additionalNotes": "string"
  },
  "pricing": { "subtotal": 0, "gst": 0, "total": 0 }
}
```

### 5.14 DGR Registration (`service_key: "dgr"`)

```json
{
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "organizationName": "string (required)",
    "abn": "string (required)",
    "organizationType": "string",
    "acncStatus": "string",
    "additionalNotes": "string"
  },
  "pricing": { "subtotal": 0, "gst": 0, "total": 0 }
}
```

---

## 6. Stripe Integration Flow

```
┌──────────┐    1. Submit Form     ┌──────────┐   3. Create Session   ┌──────────┐
│ Frontend │──────────────────────▶│ Backend  │──────────────────────▶│  Stripe  │
│          │◀──────────────────────│          │◀──────────────────────│          │
│          │  2. { checkoutUrl }   │          │  4. { session }       │          │
└────┬─────┘                      └──────────┘                      └─────┬────┘
     │                                                                     │
     │  5. Redirect to Stripe Checkout                                     │
     │─────────────────────────────────────────────────────────────────────▶│
     │                                                                     │
     │  6. User pays                                                       │
     │                                                                     │
     │  7. Redirect to /payment-success                                    │
     │◀────────────────────────────────────────────────────────────────────│
     │                                                                     │
     │                            ┌──────────┐  8. Webhook event           │
     │                            │ Backend  │◀────────────────────────────│
     │                            │          │  (checkout.session.completed)│
     │                            └──────────┘                             │
     │                               │                                     │
     │                               │ 9. UPDATE submission                │
     │                               │    payment_status = 'payment_complete'
```

### Stripe Configuration

| Setting | Value |
|---|---|
| Currency | `aud` (Australian Dollars) |
| Mode | `payment` (one-off) |
| Success URL | `{origin}/payment-success?session_id={CHECKOUT_SESSION_ID}` |
| Cancel URL | `{origin}/payment-cancelled?submission_id={submissionId}` |
| Metadata | `{ submission_id, service_key }` |
| Webhook Events | `checkout.session.completed`, `checkout.session.expired` |

---

## 7. Frontend Integration Guide

### How the frontend currently calls submission

The frontend uses `src/utils/submitCheckout.ts` which builds a `FormData` with:
- A `"payload"` field containing JSON (all non-file data, with file references)
- Binary file fields keyed by dot-path (e.g., `customer.idProof`)

### What to change in the frontend

Replace the current `console.log + alert` in `submitCheckout()` with:

```typescript
export async function submitCheckout(args: SubmitCheckoutArgs): Promise<void> {
  const formData = buildFormData(args);

  // 1. Send form data to your API
  const response = await fetch("https://your-api.com/api/checkout/submit", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser auto-sets multipart boundary
  });

  if (!response.ok) {
    throw new Error("Submission failed");
  }

  const result = await response.json();
  // result = { success: true, submissionId, stripeCheckoutUrl }

  // 2. Redirect to Stripe Checkout
  if (result.stripeCheckoutUrl) {
    window.location.href = result.stripeCheckoutUrl;
  }
}
```

### Payment Result Pages

Create two pages:
- `/payment-success` — Shows "Payment successful! Your submission is being processed."
- `/payment-cancelled` — Shows "Payment was cancelled. You can retry or contact support."

---

## 8. Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": { "field": "email", "reason": "required" }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing/invalid fields |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `STRIPE_ERROR` | 502 | Stripe API call failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix: Environment Variables

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (already configured) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) |
| `FILE_STORAGE_BUCKET` | Storage bucket for uploaded files |

---

*Generated for Nanak Accounts — February 2026*
