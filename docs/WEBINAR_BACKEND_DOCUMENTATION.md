# Nanak Accountants — Webinar API Documentation

> Complete backend specification for the Webinar module: webinar management, registrations, and admin CRUD.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema (Mongoose)](#2-database-schema-mongoose)
3. [Models](#3-models)
4. [Controllers](#4-controllers)
5. [Routes](#5-routes)
6. [App.js Mount](#6-appjs-mount)
7. [Frontend Integration Guide](#7-frontend-integration-guide)
8. [Error Handling](#8-error-handling)

---

## 1. Architecture Overview

```
┌──────────────────┐       ┌─────────────────────────┐       ┌──────────────┐
│  Frontend        │──────▶│  Backend API (Express)   │──────▶│  MongoDB     │
│  /webinars       │       │  /api/webinars/*          │       │  (Mongoose)  │
│                  │       │  /api/admin/webinars/*    │       │              │
└──────────────────┘       └─────────────────────────┘       └──────────────┘
```

### Module Summary

| Module | Purpose |
|---|---|
| **Webinars** | CRUD for webinar listings shown on `/webinars` |
| **Webinar Registrations** | User registrations for webinars |

### Flow

1. **Admin** creates/updates/deletes webinars via `/api/admin/webinars`
2. **Public** fetches published webinars via `GET /api/webinars`
3. **User** registers for a webinar via `POST /api/webinars/:id/register`
4. **Admin** views, filters, exports registrations via admin endpoints

---

## 2. Database Schema (Mongoose)

### 2.1 `webinars` Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `String` | ✅ | Webinar title |
| `description` | `String` | ✅ | Short description (shown on card) |
| `longDescription` | `String` | ❌ | Detailed description (shown on detail/modal) |
| `category` | `String` | ✅ | e.g. "Tax Compliance", "Tax Planning", "Superannuation" |
| `date` | `Date` | ✅ | Webinar date (ISO 8601) |
| `time` | `String` | ✅ | Display time e.g. "2:00 PM AEST" |
| `duration` | `String` | ✅ | e.g. "60 Min", "45 Min" |
| `speaker` | `String` | ✅ | Speaker full name |
| `speakerTitle` | `String` | ❌ | Speaker designation e.g. "Senior Tax Advisor" |
| `speakerBio` | `String` | ❌ | Short speaker bio |
| `speakerImage` | `String` | ❌ | Speaker photo URL (uploaded file path) |
| `videoLink` | `String` | ❌ | Video/meeting link (Zoom, Teams, etc.) |
| `thumbnailImage` | `String` | ❌ | Webinar thumbnail/banner image URL |
| `learnings` | `[String]` | ✅ | Array of "You'll Learn" bullet points |
| `tags` | `[String]` | ❌ | Search/filter tags |
| `maxSeats` | `Number` | ❌ | Maximum registrations allowed (null = unlimited) |
| `status` | `String` | ✅ | `draft` / `published` / `cancelled` / `completed` |
| `featured` | `Boolean` | ❌ | Show as featured webinar (default: false) |
| `recordingUrl` | `String` | ❌ | Post-event recording URL |
| `resourceLinks` | `[Object]` | ❌ | Downloadable resources `{ label, url }` |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

### 2.2 `webinar_registrations` Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `webinarId` | `ObjectId` (ref → `Webinar`) | ✅ | Reference to webinar |
| `firstName` | `String` | ✅ | Registrant first name |
| `lastName` | `String` | ✅ | Registrant last name |
| `email` | `String` | ✅ | Registrant email |
| `phone` | `String` | ❌ | Phone number |
| `company` | `String` | ❌ | Company / Organization |
| `status` | `String` | ✅ | `registered` / `attended` / `no_show` |
| `registeredAt` | `Date` | auto | Registration timestamp |
| `attendedAt` | `Date` | ❌ | When they joined the webinar |
| `notes` | `String` | ❌ | Admin notes |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

**Unique Index:** `{ webinarId: 1, email: 1 }` — prevents duplicate registrations.

---

## 3. Models

### 3.1 `webinar.model.js`

```javascript
/**
 * Webinar Model (Mongoose)
 *
 * Manages webinar listings displayed on the /webinars page.
 * Supports featured listings, status management,
 * speaker info, video links, and thumbnail images.
 */

const mongoose = require("mongoose");

const webinarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    speaker: { type: String, required: true, trim: true },
    speakerTitle: { type: String, trim: true, default: "" },
    speakerBio: { type: String, trim: true, default: "" },
    speakerImage: { type: String, default: "" },
    videoLink: { type: String, trim: true, default: "" },
    thumbnailImage: { type: String, default: "" },
    learnings: [{ type: String }],
    tags: [{ type: String }],
    maxSeats: { type: Number, default: null },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    recordingUrl: { type: String, trim: true, default: "" },
    resourceLinks: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
    collection: "webinars",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: registered count
webinarSchema.virtual("registered", {
  ref: "WebinarRegistration",
  localField: "_id",
  foreignField: "webinarId",
  count: true,
});

// Indexes
webinarSchema.index({ status: 1, date: -1 });
webinarSchema.index({ featured: -1, date: -1 });
webinarSchema.index({ category: 1 });

module.exports = mongoose.model("Webinar", webinarSchema);
```

### 3.2 `webinar-registration.model.js`

```javascript
/**
 * Webinar Registration Model (Mongoose)
 *
 * Stores registrations for webinars.
 * Unique index on webinarId + email prevents duplicate registrations.
 */

const mongoose = require("mongoose");

const webinarRegistrationSchema = new mongoose.Schema(
  {
    webinarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["registered", "attended", "no_show"],
      default: "registered",
    },
    attendedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
    collection: "webinar_registrations",
  }
);

// Prevent duplicate registrations (same email + same webinar)
webinarRegistrationSchema.index({ webinarId: 1, email: 1 }, { unique: true });

// Indexes for querying
webinarRegistrationSchema.index({ status: 1 });
webinarRegistrationSchema.index({ webinarId: 1, createdAt: -1 });

module.exports = mongoose.model("WebinarRegistration", webinarRegistrationSchema);
```

---

## 4. Controllers

### 4.1 `webinar.controller.js` — Public Webinar Endpoints

```javascript
/**
 * Webinar Controller — Public Endpoints
 *
 * Public:
 *   getAll      → Published webinars for /webinars page
 *   getById     → Single webinar detail
 *   register    → Register for a webinar
 */

const Webinar = require("../models/webinar.model");
const WebinarRegistration = require("../models/webinar-registration.model");

// ── Public: Get all published webinars ──

exports.getAll = async (req, res) => {
  try {
    const { category, upcoming, page = 1, limit = 10 } = req.query;
    const filter = { status: "published" };

    if (category) {
      filter.category = category;
    }

    if (upcoming === "true") {
      filter.date = { $gte: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Webinar.countDocuments(filter);

    const webinars = await Webinar.find(filter)
      .populate("registered")
      .sort({ featured: -1, date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: webinars,
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

// ── Public: Get single webinar ──

exports.getById = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id).populate("registered");
    if (!webinar) {
      return res.status(404).json({ success: false, error: "Webinar not found" });
    }
    res.json({ success: true, data: webinar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Public: Register for a webinar ──

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: "firstName, lastName, and email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Check webinar exists and is published
    const webinar = await Webinar.findById(req.params.id).populate("registered");
    if (!webinar || webinar.status !== "published") {
      return res.status(404).json({
        success: false,
        error: "Webinar not found or not available for registration",
      });
    }

    // Check if max seats reached
    if (webinar.maxSeats && webinar.registered >= webinar.maxSeats) {
      return res.status(400).json({
        success: false,
        error: "This webinar is fully booked",
      });
    }

    // Check duplicate registration
    const existing = await WebinarRegistration.findOne({
      webinarId: req.params.id,
      email: email.toLowerCase(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "You are already registered for this webinar",
      });
    }

    // Create registration
    const registration = await WebinarRegistration.create({
      webinarId: req.params.id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || "",
      company: company || "",
      status: "registered",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: registration,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "You are already registered for this webinar",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
```

### 4.2 `admin-webinar.controller.js` — Admin Webinar CRUD

```javascript
/**
 * Admin Webinar Controller — Webinar CRUD
 *
 * Admin:
 *   getAll          → All webinars (all statuses) with registration counts
 *   getById         → Single webinar detail
 *   create          → Create new webinar (multipart/form-data for images)
 *   update          → Update existing webinar (multipart/form-data for images)
 *   delete          → Delete webinar and its registrations
 *   toggleStatus    → Change webinar status
 */

const Webinar = require("../models/webinar.model");
const WebinarRegistration = require("../models/webinar-registration.model");

// ── Admin: Get all webinars ──

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Webinar.countDocuments(filter);

    const webinars = await Webinar.find(filter)
      .populate("registered")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: webinars,
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

// ── Admin: Get single webinar ──

exports.getById = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id).populate("registered");
    if (!webinar) {
      return res.status(404).json({ success: false, error: "Webinar not found" });
    }
    res.json({ success: true, data: webinar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Create webinar ──

exports.create = async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse JSON string fields
    if (typeof data.learnings === "string") {
      data.learnings = JSON.parse(data.learnings);
    }
    if (typeof data.tags === "string") {
      data.tags = JSON.parse(data.tags);
    }
    if (typeof data.resourceLinks === "string") {
      data.resourceLinks = JSON.parse(data.resourceLinks);
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.speakerImage && req.files.speakerImage[0]) {
        data.speakerImage = `/uploads/webinars/${req.files.speakerImage[0].filename}`;
      }
      if (req.files.thumbnailImage && req.files.thumbnailImage[0]) {
        data.thumbnailImage = `/uploads/webinars/${req.files.thumbnailImage[0].filename}`;
      }
    }

    const webinar = await Webinar.create(data);
    res.status(201).json({
      success: true,
      message: "Webinar created successfully",
      data: webinar,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ── Admin: Update webinar ──

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse JSON string fields
    if (typeof data.learnings === "string") {
      data.learnings = JSON.parse(data.learnings);
    }
    if (typeof data.tags === "string") {
      data.tags = JSON.parse(data.tags);
    }
    if (typeof data.resourceLinks === "string") {
      data.resourceLinks = JSON.parse(data.resourceLinks);
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.speakerImage && req.files.speakerImage[0]) {
        data.speakerImage = `/uploads/webinars/${req.files.speakerImage[0].filename}`;
      }
      if (req.files.thumbnailImage && req.files.thumbnailImage[0]) {
        data.thumbnailImage = `/uploads/webinars/${req.files.thumbnailImage[0].filename}`;
      }
    }

    const webinar = await Webinar.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!webinar) {
      return res.status(404).json({ success: false, error: "Webinar not found" });
    }

    res.json({
      success: true,
      message: "Webinar updated successfully",
      data: webinar,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ── Admin: Delete webinar ──

exports.delete = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndDelete(req.params.id);
    if (!webinar) {
      return res.status(404).json({ success: false, error: "Webinar not found" });
    }

    // Also delete all registrations for this webinar
    await WebinarRegistration.deleteMany({ webinarId: req.params.id });

    res.json({
      success: true,
      message: "Webinar and its registrations deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Toggle webinar status ──

exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be: draft, published, cancelled, or completed",
      });
    }

    const webinar = await Webinar.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!webinar) {
      return res.status(404).json({ success: false, error: "Webinar not found" });
    }

    res.json({ success: true, data: webinar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

### 4.3 `admin-webinar-registration.controller.js` — Admin Registration Management

```javascript
/**
 * Admin Webinar Registration Controller
 *
 * Admin:
 *   getAllForWebinar    → All registrations for a specific webinar
 *   getAll             → All registrations across all webinars
 *   updateStatus       → Update registration status (attended/no_show)
 *   delete             → Delete a registration
 *   exportCSV          → Export registrations as CSV
 */

const WebinarRegistration = require("../models/webinar-registration.model");
const Webinar = require("../models/webinar.model");

// ── Admin: Get registrations for a specific webinar ──

exports.getAllForWebinar = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = { webinarId: req.params.id };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await WebinarRegistration.countDocuments(filter);

    const registrations = await WebinarRegistration.find(filter)
      .populate("webinarId", "title date")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map to include webinar title
    const data = registrations.map((reg) => ({
      ...reg.toObject(),
      webinarTitle: reg.webinarId?.title || "Unknown",
    }));

    res.json({
      success: true,
      data,
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

// ── Admin: Get all registrations (all webinars) ──

exports.getAll = async (req, res) => {
  try {
    const { webinarId, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (webinarId) {
      filter.webinarId = webinarId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await WebinarRegistration.countDocuments(filter);

    const registrations = await WebinarRegistration.find(filter)
      .populate("webinarId", "title date")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const data = registrations.map((reg) => ({
      ...reg.toObject(),
      webinarTitle: reg.webinarId?.title || "Unknown",
    }));

    res.json({
      success: true,
      data,
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

// ── Admin: Update registration status ──

exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!["registered", "attended", "no_show"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be: registered, attended, or no_show",
      });
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === "attended") updateData.attendedAt = new Date();

    const registration = await WebinarRegistration.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }

    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Delete registration ──

exports.delete = async (req, res) => {
  try {
    const registration = await WebinarRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }
    res.json({ success: true, message: "Registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Export registrations as CSV ──

exports.exportCSV = async (req, res) => {
  try {
    const registrations = await WebinarRegistration.find({
      webinarId: req.params.id,
    })
      .populate("webinarId", "title date")
      .sort({ createdAt: -1 });

    const webinar = await Webinar.findById(req.params.id);
    const webinarTitle = webinar ? webinar.title.replace(/[^a-zA-Z0-9]/g, "_") : "webinar";

    // Build CSV
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Status",
      "Registered At",
      "Attended At",
      "Notes",
    ];

    const rows = registrations.map((reg) => [
      reg.firstName,
      reg.lastName,
      reg.email,
      reg.phone || "",
      reg.company || "",
      reg.status,
      reg.createdAt ? reg.createdAt.toISOString() : "",
      reg.attendedAt ? reg.attendedAt.toISOString() : "",
      reg.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${webinarTitle}_registrations.csv"`
    );
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

---

## 5. Routes

### 5.1 `webinar.routes.js` — Public Routes

```javascript
/**
 * Webinar Routes — Public
 *
 * GET  /api/webinars              → List published webinars
 * GET  /api/webinars/:id          → Get single webinar
 * POST /api/webinars/:id/register → Register for a webinar
 */

const express = require("express");
const router = express.Router();
const webinarController = require("../controllers/webinar.controller");

router.get("/", webinarController.getAll);
router.get("/:id", webinarController.getById);
router.post("/:id/register", webinarController.register);

module.exports = router;
```

### 5.2 `admin-webinar.routes.js` — Admin Webinar CRUD Routes

```javascript
/**
 * Admin Webinar Routes
 *
 * GET    /api/admin/webinars                          → List all webinars
 * GET    /api/admin/webinars/:id                      → Get single webinar
 * POST   /api/admin/webinars                          → Create webinar (multipart)
 * PUT    /api/admin/webinars/:id                      → Update webinar (multipart)
 * DELETE /api/admin/webinars/:id                      → Delete webinar
 * PATCH  /api/admin/webinars/:id/status               → Toggle webinar status
 * GET    /api/admin/webinars/:id/registrations         → Get registrations for webinar
 * GET    /api/admin/webinars/:id/registrations/export  → Export CSV
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const adminWebinarController = require("../controllers/admin-webinar.controller");
const adminRegController = require("../controllers/admin-webinar-registration.controller");

// ── Multer config for webinar images ──

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/webinars/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
    }
  },
});

const uploadFields = upload.fields([
  { name: "speakerImage", maxCount: 1 },
  { name: "thumbnailImage", maxCount: 1 },
]);

// ── Webinar CRUD routes ──

router.get("/", adminWebinarController.getAll);
router.get("/:id", adminWebinarController.getById);
router.post("/", uploadFields, adminWebinarController.create);
router.put("/:id", uploadFields, adminWebinarController.update);
router.delete("/:id", adminWebinarController.delete);
router.patch("/:id/status", adminWebinarController.toggleStatus);

// ── Registration routes (nested under webinar) ──

router.get("/:id/registrations", adminRegController.getAllForWebinar);
router.get("/:id/registrations/export", adminRegController.exportCSV);

module.exports = router;
```

### 5.3 `admin-webinar-registration.routes.js` — Admin Registration Routes

```javascript
/**
 * Admin Webinar Registration Routes
 *
 * GET    /api/admin/webinar-registrations       → List all registrations
 * PUT    /api/admin/webinar-registrations/:id   → Update registration status
 * DELETE /api/admin/webinar-registrations/:id   → Delete registration
 */

const express = require("express");
const router = express.Router();
const adminRegController = require("../controllers/admin-webinar-registration.controller");

router.get("/", adminRegController.getAll);
router.put("/:id", adminRegController.updateStatus);
router.delete("/:id", adminRegController.delete);

module.exports = router;
```

---

## 6. App.js Mount

Add the following to your `app.js` file:

```javascript
// ── Webinar Module ──

const fs = require("fs");
const path = require("path");

// Ensure upload directory exists
const webinarUploadsDir = path.join(__dirname, "uploads", "webinars");
if (!fs.existsSync(webinarUploadsDir)) {
  fs.mkdirSync(webinarUploadsDir, { recursive: true });
}

// Import routes
const webinarRoutes = require("./routes/webinar.routes");
const adminWebinarRoutes = require("./routes/admin-webinar.routes");
const adminWebinarRegRoutes = require("./routes/admin-webinar-registration.routes");

// Mount public routes (no auth)
app.use("/api/webinars", webinarRoutes);

// Mount admin routes (auth required)
app.use("/api/admin/webinars", authMiddleware, adminWebinarRoutes);
app.use("/api/admin/webinar-registrations", authMiddleware, adminWebinarRegRoutes);

// Serve uploaded webinar images statically
app.use("/uploads/webinars", express.static(path.resolve(process.cwd(), "uploads/webinars")));
```

---

## 7. Frontend Integration Guide

Once the APIs are live, update `src/pages/WebinarPage.tsx`:

1. Replace the static `WEBINARS` array with a fetch to `GET /api/webinars?upcoming=true`
2. Replace the simulated registration submit with `POST /api/webinars/:id/register`
3. Use the `registered` virtual count from the API response
4. Show `thumbnailImage` and `speakerImage` from API data
5. Use `videoLink` for a "Join Webinar" button (visible only on webinar day)
6. Show `recordingUrl` for completed webinars as "Watch Recording"

### Admin Panel

Build admin UI at `/admin/webinars` with two tabs:

| Tab | Features |
|---|---|
| **Webinar List** | Table with thumbnail, title, category, date, speaker, status badge, registered count, actions (edit/delete/toggle status). Add button opens form with all fields including image uploads. |
| **Submissions** | Table with name, email, phone, company, webinar title, status badge, date. Filters by webinar and status. Export CSV per webinar. Bulk status update. |

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
| `400` | Validation error, invalid status, missing required fields |
| `404` | Webinar or registration not found |
| `409` | Duplicate registration (same email + webinar) |
| `500` | Server/database error |
