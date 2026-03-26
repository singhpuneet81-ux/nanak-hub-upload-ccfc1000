# Nanak Accountants — BAS Consultation API Documentation

> Complete backend specification for the BAS Consultation module: public form submissions and admin management.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema (Mongoose)](#2-database-schema-mongoose)
3. [Model](#3-model)
4. [Controller](#4-controller)
5. [Routes](#5-routes)
6. [App.js Mount](#6-appjs-mount)
7. [Frontend Integration Guide](#7-frontend-integration-guide)
8. [Error Handling](#8-error-handling)

---

## 1. Architecture Overview

```
┌──────────────────────┐       ┌─────────────────────────┐       ┌──────────────┐
│  Frontend            │──────▶│  Backend API (Express)   │──────▶│  MongoDB     │
│  /bas-consultation   │       │  /api/bas-consultations/* │       │  (Mongoose)  │
└──────────────────────┘       └─────────────────────────┘       └──────────────┘
```

### Module Summary

| Module | Purpose |
|---|---|
| **BAS Consultations** | Public form submission + Admin CRUD for BAS consultation requests |

### Flow

1. **User** fills the BAS consultation form on `/bas-consultation`
2. **Frontend** sends form data to `POST /api/bas-consultations`
3. **Backend** validates and saves the consultation request
4. **Admin** views, filters, updates status, adds notes, and deletes requests via admin endpoints

---

## 2. Database Schema (Mongoose)

### `bas_consultations` Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | `String` | ✅ | Full name of the person requesting consultation |
| `email` | `String` | ✅ | Email address |
| `phone` | `String` | ✅ | Phone number |
| `businessName` | `String` | ❌ | Business name (optional) |
| `message` | `String` | ❌ | BAS requirements or questions |
| `status` | `String` | ❌ | Request status: `new`, `contacted`, `in_progress`, `completed`, `cancelled` (default: `new`) |
| `adminNotes` | `String` | ❌ | Internal notes from admin |
| `assignedTo` | `String` | ❌ | Staff member assigned to this request |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

---

## 3. Model

### `bas-consultation.model.js`

```javascript
/**
 * BAS Consultation Model (Mongoose)
 *
 * Stores BAS consultation requests submitted via the /bas-consultation page.
 */

const mongoose = require("mongoose");

const basConsultationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name must be less than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [255, "Email must be less than 255 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, "Business name must be less than 200 characters"],
      default: "",
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Message must be less than 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "completed", "cancelled"],
      default: "new",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "bas_consultations",
  }
);

// Indexes
basConsultationSchema.index({ status: 1, createdAt: -1 });
basConsultationSchema.index({ email: 1 });

module.exports = mongoose.model("BasConsultation", basConsultationSchema);
```

---

## 4. Controller

### `bas-consultation.controller.js`

```javascript
/**
 * BAS Consultation Controller
 *
 * Public:
 *   submit       → Submit a new BAS consultation request
 *
 * Admin:
 *   getAll       → List all consultation requests with filters
 *   getById      → Get single consultation detail
 *   updateStatus → Update request status
 *   addNote      → Add admin notes
 *   delete       → Delete a consultation request
 */

const BasConsultation = require("../models/bas-consultation.model");

// ── Public: Submit consultation request ──

exports.submit = async (req, res) => {
  try {
    const { fullName, email, phone, businessName, message } = req.body;

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: "Full name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: "Invalid email address" });
    }

    const consultation = await BasConsultation.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      businessName: businessName ? businessName.trim() : "",
      message: message ? message.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "BAS consultation request submitted successfully",
      data: {
        id: consultation._id,
        fullName: consultation.fullName,
        email: consultation.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Get all consultation requests ──

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BasConsultation.countDocuments(filter);

    const consultations = await BasConsultation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: consultations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Get single consultation ──

exports.getById = async (req, res) => {
  try {
    const consultation = await BasConsultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, error: "Consultation request not found" });
    }
    res.json({ success: true, data: consultation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Update status ──

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "contacted", "in_progress", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be: ${validStatuses.join(", ")}`,
      });
    }

    const consultation = await BasConsultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, error: "Consultation request not found" });
    }

    res.json({ success: true, data: consultation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Add notes ──

exports.addNote = async (req, res) => {
  try {
    const { adminNotes, assignedTo } = req.body;

    const updateData = {};
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const consultation = await BasConsultation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, error: "Consultation request not found" });
    }

    res.json({ success: true, data: consultation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Delete consultation ──

exports.delete = async (req, res) => {
  try {
    const consultation = await BasConsultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, error: "Consultation request not found" });
    }
    res.json({ success: true, message: "Consultation request deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

---

## 5. Routes

### 5.1 `bas-consultation.routes.js` — Public Routes

```javascript
/**
 * BAS Consultation Routes — Public
 *
 * POST /api/bas-consultations → Submit a BAS consultation request
 */

const express = require("express");
const router = express.Router();
const basController = require("../controllers/bas-consultation.controller");

router.post("/", basController.submit);

module.exports = router;
```

### 5.2 `admin-bas-consultation.routes.js` — Admin Routes

```javascript
/**
 * Admin BAS Consultation Routes
 *
 * GET    /api/admin/bas-consultations          → List all consultation requests
 * GET    /api/admin/bas-consultations/:id       → Get single consultation
 * PATCH  /api/admin/bas-consultations/:id/status → Update status
 * PUT    /api/admin/bas-consultations/:id/notes  → Add/update admin notes
 * DELETE /api/admin/bas-consultations/:id        → Delete consultation
 */

const express = require("express");
const router = express.Router();
const basController = require("../controllers/bas-consultation.controller");

router.get("/", basController.getAll);
router.get("/:id", basController.getById);
router.patch("/:id/status", basController.updateStatus);
router.put("/:id/notes", basController.addNote);
router.delete("/:id", basController.delete);

module.exports = router;
```

---

## 6. App.js Mount

Add the following to your `app.js` file:

```javascript
// ── BAS Consultation Module ──

// Import routes
const basConsultationRoutes = require("./routes/bas-consultation.routes");
const adminBasConsultationRoutes = require("./routes/admin-bas-consultation.routes");

// Mount public routes (no auth)
app.use("/api/bas-consultations", basConsultationRoutes);

// Mount admin routes (auth required)
app.use("/api/admin/bas-consultations", authMiddleware, adminBasConsultationRoutes);
```

---

## 7. Frontend Integration Guide

The frontend form at `/bas-consultation` calls:

```javascript
POST https://api.connect.cavaluer.com/api/bas-consultations
Content-Type: application/json

{
  "fullName": "John Smith",
  "email": "john@example.com",
  "phone": "0412 345 678",
  "businessName": "Smith Consulting",
  "message": "I need help with quarterly BAS lodgement..."
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "BAS consultation request submitted successfully",
  "data": {
    "id": "665f...abc",
    "fullName": "John Smith",
    "email": "john@example.com"
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Full name is required"
}
```

---

## 8. Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error description message"
}
```

| HTTP Code | Scenario |
|---|---|
| `400` | Validation error, missing required fields, invalid email |
| `404` | Consultation request not found |
| `500` | Server/database error |

---

## API Endpoints Summary

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bas-consultations` | Submit a BAS consultation request |

### Admin (requires `authMiddleware`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/bas-consultations` | List all requests (supports `?status=&search=&page=&limit=`) |
| `GET` | `/api/admin/bas-consultations/:id` | Get single request detail |
| `PATCH` | `/api/admin/bas-consultations/:id/status` | Update status `{ "status": "contacted" }` |
| `PUT` | `/api/admin/bas-consultations/:id/notes` | Add/update notes `{ "adminNotes": "...", "assignedTo": "..." }` |
| `DELETE` | `/api/admin/bas-consultations/:id` | Delete request |

### API Base URL

Use the same API base URL as other modules: `https://api.connect.cavaluer.com`

All admin endpoints require the `authMiddleware` (same auth token as Careers/Webinars).
