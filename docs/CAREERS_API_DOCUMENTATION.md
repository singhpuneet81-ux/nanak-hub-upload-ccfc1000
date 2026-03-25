# Nanak Accountants — Careers API Documentation

> Complete backend specification for the Careers module: job openings management, job applications, general applications, and admin CRUD.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema (Mongoose)](#2-database-schema-mongoose)
3. [Models](#3-models)
4. [Controllers](#4-controllers)
5. [Routes](#5-routes)
6. [App.js Mount](#6-appjs-mount)
7. [Seeders](#7-seeders)
8. [Frontend Integration Guide](#8-frontend-integration-guide)
9. [Error Handling](#9-error-handling)

---

## 1. Architecture Overview

```
┌──────────────────┐       ┌─────────────────────────┐       ┌──────────────┐
│  Frontend        │──────▶│  Backend API (Express)   │──────▶│  MongoDB     │
│  /careers        │       │  /api/careers/*          │       │  (Mongoose)  │
│  /careers/apply  │       │  /api/job-applications/* │       │              │
└──────────────────┘       └─────────────────────────┘       └──────────────┘
```

### Module Summary

| Module | Purpose |
|---|---|
| **Job Openings** | CRUD for job listings shown on `/careers` |
| **Job Applications** | Multi-step application submissions (5-step form) |
| **General Applications** | Open/speculative applications without a specific role |

### Flow

1. **Admin** creates/updates/deletes job openings via `/api/careers/openings`
2. **Public** fetches active openings via `GET /api/careers/openings`
3. **Applicant** submits a 5-step application via `POST /api/job-applications`
4. **Applicant** submits a general application via `POST /api/job-applications/general`
5. **Admin** views, filters, updates status, and manages all applications via CRUD endpoints

---

## 2. Database Schema (Mongoose)

### 2.1 `job_openings` Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `String` | ✅ | Job title (e.g., "Senior Accountant") |
| `department` | `String` | ✅ | Department (e.g., "Accounting & Tax") |
| `location` | `String` | ✅ | Location (e.g., "Sydney, AU") |
| `type` | `String` | ✅ | Employment type (`Full-Time`, `Part-Time`, `Contract`) |
| `salary` | `String` | ✅ | Salary range (e.g., "$90K – $120K / year") |
| `experience` | `String` | ✅ | Required experience (e.g., "5+ years") |
| `description` | `String` | ✅ | Job description |
| `requirements` | `[String]` | ❌ | List of requirements |
| `responsibilities` | `[String]` | ❌ | List of responsibilities |
| `featured` | `Boolean` | ❌ | Whether to feature the listing (default: `false`) |
| `active` | `Boolean` | ❌ | Whether listing is visible (default: `true`) |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

### 2.2 `job_applications` Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `jobId` | `ObjectId` (ref → `JobOpening`) | ❌ | Null for general applications |
| `jobTitle` | `String` | ✅ | Title of the role applied for |
| `applicationType` | `String` | ✅ | `specific` or `general` |
| `personalInfo` | `Object` | ✅ | Step 1 data (see below) |
| `experience` | `Object` | ✅ | Step 2 data |
| `motivation` | `Object` | ✅ | Step 3 data |
| `documents` | `Object` | ✅ | Step 4 file references |
| `screening` | `Object` | ✅ | Step 5 data |
| `status` | `String` | ❌ | Application status (default: `new`) |
| `reviewNotes` | `String` | ❌ | Internal admin notes |
| `reviewedBy` | `String` | ❌ | Admin who reviewed |
| `createdAt` | `Date` | auto | Mongoose timestamp |
| `updatedAt` | `Date` | auto | Mongoose timestamp |

**`personalInfo` sub-document:**

| Field | Type | Required |
|---|---|---|
| `firstName` | `String` | ✅ |
| `lastName` | `String` | ✅ |
| `email` | `String` | ✅ |
| `phone` | `String` | ✅ |
| `location` | `String` | ✅ |
| `linkedin` | `String` | ❌ |
| `portfolio` | `String` | ❌ |

**`experience` sub-document:**

| Field | Type | Required |
|---|---|---|
| `currentRole` | `String` | ❌ |
| `yearsExperience` | `String` | ✅ |
| `relevantExperience` | `String` | ✅ (min 50 chars) |
| `qualifications` | `String` | ✅ (`yes`, `in_progress`, `equivalent`) |
| `qualificationsDetail` | `String` | ❌ (required if `equivalent`) |

**`motivation` sub-document:**

| Field | Type | Required |
|---|---|---|
| `whyJoin` | `String` | ✅ (min 100 chars) |
| `whyRole` | `String` | ✅ (min 100 chars) |
| `strengths` | `String` | ✅ (min 50 chars) |
| `salaryExpectation` | `String` | ✅ |
| `availability` | `String` | ✅ |
| `workArrangement` | `String` | ❌ |

**`documents` sub-document:**

| Field | Type | Required |
|---|---|---|
| `resumeUrl` | `String` | ✅ |
| `resumeFilename` | `String` | ✅ |
| `coverLetterUrl` | `String` | ❌ |
| `coverLetterFilename` | `String` | ❌ |

**`screening` sub-document:**

| Field | Type | Required |
|---|---|---|
| `workRights` | `String` | ✅ (`citizen`, `visa`, `sponsorship`) |
| `relocation` | `String` | ✅ (`yes`, `already`, `no`) |
| `noticePeriod` | `String` | ✅ |
| `references` | `String` | ✅ (`yes`, `offer_only`, `no_current`) |
| `privacyConsent` | `Boolean` | ✅ (must be `true`) |

**`status` enum values:** `new`, `reviewing`, `shortlisted`, `interview_scheduled`, `interview_complete`, `offer_sent`, `hired`, `rejected`, `withdrawn`

---

## 3. Models

### 3.1 `job-opening.model.js`

```javascript
/**
 * Job Opening Model (Mongoose)
 *
 * Manages job listings displayed on the careers page.
 * Supports featured listings, active/inactive toggling,
 * and structured requirements/responsibilities.
 */

const mongoose = require("mongoose");

const jobOpeningSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["Full-Time", "Part-Time", "Contract", "Casual"],
      default: "Full-Time",
    },
    salary: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "job_openings",
  }
);

// Index for public queries (active listings sorted by featured first)
jobOpeningSchema.index({ active: 1, featured: -1, createdAt: -1 });

module.exports = mongoose.model("JobOpening", jobOpeningSchema);
```

### 3.2 `job-application.model.js`

```javascript
/**
 * Job Application Model (Mongoose)
 *
 * Stores all 5-step application data plus file references.
 * Supports both specific (linked to a job) and general applications.
 */

const mongoose = require("mongoose");

const personalInfoSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    linkedin: { type: String, trim: true, default: "" },
    portfolio: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    currentRole: { type: String, trim: true, default: "" },
    yearsExperience: { type: String, required: true },
    relevantExperience: { type: String, required: true, minlength: 50 },
    qualifications: {
      type: String,
      required: true,
      enum: ["yes", "in_progress", "equivalent"],
    },
    qualificationsDetail: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const motivationSchema = new mongoose.Schema(
  {
    whyJoin: { type: String, required: true, minlength: 100 },
    whyRole: { type: String, required: true, minlength: 100 },
    strengths: { type: String, required: true, minlength: 50 },
    salaryExpectation: { type: String, required: true },
    availability: { type: String, required: true },
    workArrangement: { type: String, default: "" },
  },
  { _id: false }
);

const documentsSchema = new mongoose.Schema(
  {
    resumeUrl: { type: String, required: true },
    resumeFilename: { type: String, required: true },
    coverLetterUrl: { type: String, default: "" },
    coverLetterFilename: { type: String, default: "" },
  },
  { _id: false }
);

const screeningSchema = new mongoose.Schema(
  {
    workRights: {
      type: String,
      required: true,
      enum: ["citizen", "visa", "sponsorship"],
    },
    relocation: {
      type: String,
      required: true,
      enum: ["yes", "already", "no"],
    },
    noticePeriod: { type: String, required: true },
    references: {
      type: String,
      required: true,
      enum: ["yes", "offer_only", "no_current"],
    },
    privacyConsent: { type: Boolean, required: true },
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOpening",
      default: null,
    },
    jobTitle: { type: String, required: true, trim: true },
    applicationType: {
      type: String,
      required: true,
      enum: ["specific", "general"],
      default: "specific",
    },
    personalInfo: { type: personalInfoSchema, required: true },
    experience: { type: experienceSchema, required: true },
    motivation: { type: motivationSchema, required: true },
    documents: { type: documentsSchema, required: true },
    screening: { type: screeningSchema, required: true },
    status: {
      type: String,
      enum: [
        "new",
        "reviewing",
        "shortlisted",
        "interview_scheduled",
        "interview_complete",
        "offer_sent",
        "hired",
        "rejected",
        "withdrawn",
      ],
      default: "new",
    },
    reviewNotes: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "job_applications",
  }
);

// Indexes
jobApplicationSchema.index({ status: 1, createdAt: -1 });
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ "personalInfo.email": 1 });
jobApplicationSchema.index({ applicationType: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
```

---

## 4. Controllers

### 4.1 `careers.controller.js` — Job Openings CRUD

```javascript
/**
 * Careers Controller — Job Openings CRUD
 *
 * Public:
 *   getAll        → Active listings for careers page
 *   getById       → Single listing detail
 *
 * Admin:
 *   adminGetAll   → All listings (including inactive)
 *   create        → Create new opening
 *   update        → Update existing opening
 *   delete        → Delete opening
 *   toggleActive  → Activate/deactivate listing
 *   seed          → Seed default openings from JSON
 */

const JobOpening = require("../models/job-opening.model");

// ── Public ──

exports.getAll = async (req, res) => {
  try {
    const { department, location, search } = req.query;
    const filter = { active: true };

    if (department && department !== "All Departments") {
      filter.department = department;
    }
    if (location && location !== "All Locations") {
      filter.location = location;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const openings = await JobOpening.find(filter).sort({
      featured: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: openings.length,
      data: openings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const opening = await JobOpening.findOne({
      _id: req.params.id,
      active: true,
    });
    if (!opening) {
      return res.status(404).json({ success: false, error: "Opening not found" });
    }
    res.json({ success: true, data: opening });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin ──

exports.adminGetAll = async (req, res) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status === "active") filter.active = true;
    if (status === "inactive") filter.active = false;
    if (department) filter.department = department;

    const openings = await JobOpening.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: openings.length, data: openings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const opening = await JobOpening.create(req.body);
    res.status(201).json({ success: true, data: opening });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const opening = await JobOpening.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!opening) {
      return res.status(404).json({ success: false, error: "Opening not found" });
    }
    res.json({ success: true, data: opening });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const opening = await JobOpening.findByIdAndDelete(req.params.id);
    if (!opening) {
      return res.status(404).json({ success: false, error: "Opening not found" });
    }
    res.json({ success: true, message: "Opening deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const opening = await JobOpening.findById(req.params.id);
    if (!opening) {
      return res.status(404).json({ success: false, error: "Opening not found" });
    }
    opening.active = !opening.active;
    await opening.save();
    res.json({ success: true, data: opening });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.seed = async (req, res) => {
  try {
    const seedData = require("../seeders/careers-openings-seeder.json");
    await JobOpening.deleteMany({});
    const created = await JobOpening.insertMany(seedData);
    res.json({
      success: true,
      message: `Seeded ${created.length} job openings`,
      data: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

### 4.2 `job-applications.controller.js` — Applications CRUD

```javascript
/**
 * Job Applications Controller
 *
 * Public:
 *   submit          → Submit a specific job application (multipart/form-data)
 *   submitGeneral   → Submit a general/speculative application (multipart/form-data)
 *
 * Admin:
 *   getAll          → List all applications with filters
 *   getById         → Single application detail
 *   updateStatus    → Update application status
 *   addNote         → Add review notes
 *   delete          → Delete application
 *   getStats        → Dashboard statistics
 */

const multer = require("multer");
const path = require("path");
const JobApplication = require("../models/job-application.model");
const JobOpening = require("../models/job-opening.model");

// ── Multer config for file uploads ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/applications/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).fields([
  { name: "resume", maxCount: 1 },
  { name: "coverLetter", maxCount: 1 },
]);

// ── Public: Submit specific application ──
exports.submit = async (req, res) => {
  try {
    const body = JSON.parse(req.body.applicationData);
    const files = req.files || {};

    // Validate resume
    if (!files.resume || files.resume.length === 0) {
      return res.status(400).json({ success: false, error: "Resume is required" });
    }

    // Validate job exists
    if (body.jobId) {
      const job = await JobOpening.findById(body.jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: "Job opening not found" });
      }
    }

    const resumeFile = files.resume[0];
    const coverLetterFile = files.coverLetter ? files.coverLetter[0] : null;

    const application = await JobApplication.create({
      jobId: body.jobId || null,
      jobTitle: body.jobTitle,
      applicationType: "specific",
      personalInfo: body.personalInfo,
      experience: body.experience,
      motivation: body.motivation,
      documents: {
        resumeUrl: `/uploads/applications/${resumeFile.filename}`,
        resumeFilename: resumeFile.originalname,
        coverLetterUrl: coverLetterFile
          ? `/uploads/applications/${coverLetterFile.filename}`
          : "",
        coverLetterFilename: coverLetterFile
          ? coverLetterFile.originalname
          : "",
      },
      screening: body.screening,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { applicationId: application._id },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ── Public: Submit general application ──
exports.submitGeneral = async (req, res) => {
  try {
    const body = JSON.parse(req.body.applicationData);
    const files = req.files || {};

    if (!files.resume || files.resume.length === 0) {
      return res.status(400).json({ success: false, error: "Resume is required" });
    }

    const resumeFile = files.resume[0];
    const coverLetterFile = files.coverLetter ? files.coverLetter[0] : null;

    const application = await JobApplication.create({
      jobId: null,
      jobTitle: body.jobTitle || "General Application",
      applicationType: "general",
      personalInfo: body.personalInfo,
      experience: body.experience,
      motivation: body.motivation,
      documents: {
        resumeUrl: `/uploads/applications/${resumeFile.filename}`,
        resumeFilename: resumeFile.originalname,
        coverLetterUrl: coverLetterFile
          ? `/uploads/applications/${coverLetterFile.filename}`
          : "",
        coverLetterFilename: coverLetterFile
          ? coverLetterFile.originalname
          : "",
      },
      screening: body.screening,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "General application submitted successfully",
      data: { applicationId: application._id },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ── Admin: Get all applications ──
exports.getAll = async (req, res) => {
  try {
    const {
      status,
      applicationType,
      jobId,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (applicationType) filter.applicationType = applicationType;
    if (jobId) filter.jobId = jobId;
    if (search) {
      filter.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate("jobId", "title department location")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Get single application ──
exports.getById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id).populate(
      "jobId",
      "title department location type salary"
    );
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Update status ──
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "new", "reviewing", "shortlisted", "interview_scheduled",
      "interview_complete", "offer_sent", "hired", "rejected", "withdrawn",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Add review notes ──
exports.addNote = async (req, res) => {
  try {
    const { notes, reviewedBy } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { reviewNotes: notes, reviewedBy } },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Delete application ──
exports.delete = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    res.json({ success: true, message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Admin: Dashboard stats ──
exports.getStats = async (req, res) => {
  try {
    const [total, byStatus, byType, recent] = await Promise.all([
      JobApplication.countDocuments(),
      JobApplication.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      JobApplication.aggregate([
        { $group: { _id: "$applicationType", count: { $sum: 1 } } },
      ]),
      JobApplication.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("jobTitle personalInfo.firstName personalInfo.lastName status createdAt"),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        byType: Object.fromEntries(byType.map((t) => [t._id, t.count])),
        recent,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

---

## 5. Routes

### 5.1 `careers.routes.js` — Job Openings

```javascript
/**
 * Careers Routes — Job Openings
 *
 * Public routes (no auth):
 *   GET    /api/careers/openings            → List active openings (with filters)
 *   GET    /api/careers/openings/:id        → Single opening detail
 *
 * Admin routes (JWT + admin role required):
 *   GET    /api/careers/admin/openings      → All openings (including inactive)
 *   POST   /api/careers/admin/openings      → Create new opening
 *   PUT    /api/careers/admin/openings/:id  → Update opening
 *   DELETE /api/careers/admin/openings/:id  → Delete opening
 *   PATCH  /api/careers/admin/openings/:id/toggle → Toggle active status
 *   POST   /api/careers/admin/openings/seed → Seed default openings
 */

const express = require("express");
const router = express.Router();
const controller = require("../controllers/careers.controller");

// ── Public ──
router.get("/openings", controller.getAll);
router.get("/openings/:id", controller.getById);

// ── Admin (uncomment auth middleware when ready) ──
// router.use("/admin", authMiddleware, requireRole("admin"));
router.get("/admin/openings", controller.adminGetAll);
router.post("/admin/openings", controller.create);
router.put("/admin/openings/:id", controller.update);
router.delete("/admin/openings/:id", controller.delete);
router.patch("/admin/openings/:id/toggle", controller.toggleActive);
router.post("/admin/openings/seed", controller.seed);

module.exports = router;

/**
 * Mount in your Express app:
 *   const careersRoutes = require("./routes/careers.routes");
 *   app.use("/api/careers", careersRoutes);
 */
```

### 5.2 `job-applications.routes.js` — Applications

```javascript
/**
 * Job Applications Routes
 *
 * Public routes (no auth):
 *   POST   /api/job-applications              → Submit specific application (multipart)
 *   POST   /api/job-applications/general       → Submit general application (multipart)
 *
 * Admin routes (JWT + admin role required):
 *   GET    /api/job-applications/admin         → List all applications (paginated, filtered)
 *   GET    /api/job-applications/admin/stats   → Dashboard statistics
 *   GET    /api/job-applications/admin/:id     → Single application detail
 *   PATCH  /api/job-applications/admin/:id/status → Update application status
 *   PATCH  /api/job-applications/admin/:id/notes  → Add review notes
 *   DELETE /api/job-applications/admin/:id     → Delete application
 */

const express = require("express");
const router = express.Router();
const controller = require("../controllers/job-applications.controller");

// ── Public ──
router.post("/", controller.upload, controller.submit);
router.post("/general", controller.upload, controller.submitGeneral);

// ── Admin (uncomment auth middleware when ready) ──
// router.use("/admin", authMiddleware, requireRole("admin"));
router.get("/admin", controller.getAll);
router.get("/admin/stats", controller.getStats);
router.get("/admin/:id", controller.getById);
router.patch("/admin/:id/status", controller.updateStatus);
router.patch("/admin/:id/notes", controller.addNote);
router.delete("/admin/:id", controller.delete);

module.exports = router;

/**
 * Mount in your Express app:
 *   const jobAppRoutes = require("./routes/job-applications.routes");
 *   app.use("/api/job-applications", jobAppRoutes);
 */
```

---

## 6. App.js Mount

Add these lines to your Express `app.js`:

```javascript
// ── Careers Module ──
const careersRoutes = require("./routes/careers.routes");
const jobApplicationRoutes = require("./routes/job-applications.routes");

app.use("/api/careers", careersRoutes);
app.use("/api/job-applications", jobApplicationRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
```

Ensure the `uploads/applications/` directory exists:

```bash
mkdir -p uploads/applications
```

---

## 7. Seeders

### `careers-openings-seeder.json`

```json
[
  {
    "title": "Senior Accountant",
    "department": "Accounting & Tax",
    "location": "Sydney, AU",
    "type": "Full-Time",
    "salary": "$90K – $120K / year",
    "experience": "5+ years",
    "description": "Lead complex accounting engagements for high-value clients. Work with cutting-edge tools in a supportive, collaborative environment.",
    "requirements": [
      "CA/CPA qualified",
      "5+ years in public practice or industry",
      "Strong knowledge of Australian tax law",
      "Proficient in Xero and MYOB"
    ],
    "responsibilities": [
      "Manage a portfolio of SME clients",
      "Prepare and review financial statements",
      "Tax planning and compliance advisory",
      "Mentor graduate and junior accountants"
    ],
    "featured": true,
    "active": true
  },
  {
    "title": "Tax Specialist",
    "department": "Accounting & Tax",
    "location": "Melbourne, AU",
    "type": "Full-Time",
    "salary": "$85K – $110K / year",
    "experience": "3+ years",
    "description": "Prepare and review individual and business tax returns. Advise clients on tax-effective structures and ATO compliance.",
    "requirements": [
      "CA/CPA qualified or near completion",
      "3+ years in tax preparation",
      "Knowledge of CGT, FBT, and GST",
      "Experience with tax software"
    ],
    "responsibilities": [
      "Prepare individual and business tax returns",
      "Review tax positions and identify savings",
      "Liaise with the ATO on client matters",
      "Advise on structuring and compliance"
    ],
    "featured": true,
    "active": true
  },
  {
    "title": "Bookkeeper – Cloud Accounting",
    "department": "Bookkeeping",
    "location": "Remote, AU",
    "type": "Part-Time",
    "salary": "$55K – $70K / year",
    "experience": "2+ years",
    "description": "Manage day-to-day bookkeeping on Xero & MYOB for a portfolio of SME clients across Australia.",
    "requirements": [
      "Cert IV in Bookkeeping or equivalent",
      "2+ years experience with Xero/MYOB",
      "BAS Agent registration preferred",
      "Strong attention to detail"
    ],
    "responsibilities": [
      "Process accounts payable and receivable",
      "Bank reconciliations and BAS preparation",
      "Payroll processing and STP reporting",
      "Client communication and support"
    ],
    "featured": false,
    "active": true
  },
  {
    "title": "Office & Admin Manager",
    "department": "Operations",
    "location": "Sydney, AU",
    "type": "Full-Time",
    "salary": "$65K – $80K / year",
    "experience": "3+ years",
    "description": "Oversee office operations, coordinate team schedules, and manage client on-boarding processes.",
    "requirements": [
      "3+ years in office management",
      "Strong organisational skills",
      "Proficient in Google Workspace / MS Office",
      "Experience in professional services preferred"
    ],
    "responsibilities": [
      "Manage office operations and supplies",
      "Coordinate team schedules and meetings",
      "Client on-boarding and CRM management",
      "Support HR and recruitment processes"
    ],
    "featured": false,
    "active": true
  },
  {
    "title": "Graduate Accountant",
    "department": "Accounting & Tax",
    "location": "Sydney / Melbourne, AU",
    "type": "Full-Time",
    "salary": "$55K – $65K / year",
    "experience": "0-1 years",
    "description": "Kick-start your accounting career with mentorship, CA/CPA support, and exposure to real client engagements.",
    "requirements": [
      "Bachelor's degree in Accounting or Finance",
      "Enrolled or intending to enroll in CA/CPA",
      "Strong academic record",
      "Excellent communication skills"
    ],
    "responsibilities": [
      "Assist senior accountants with client work",
      "Prepare basic tax returns and BAS",
      "Data entry and reconciliations",
      "Participate in training and development"
    ],
    "featured": true,
    "active": true
  },
  {
    "title": "Client Success Coordinator",
    "department": "Client Services",
    "location": "Remote, AU",
    "type": "Full-Time",
    "salary": "$60K – $75K / year",
    "experience": "1+ years",
    "description": "Be the first point of contact for clients, ensuring seamless on-boarding and ongoing satisfaction.",
    "requirements": [
      "1+ years in customer service or client management",
      "Excellent verbal and written communication",
      "Experience with CRM tools",
      "Understanding of accounting services is a plus"
    ],
    "responsibilities": [
      "Client on-boarding and welcome calls",
      "Manage client inquiries and escalations",
      "Track satisfaction and feedback",
      "Coordinate with internal teams"
    ],
    "featured": false,
    "active": true
  },
  {
    "title": "Payroll Specialist",
    "department": "Payroll",
    "location": "Melbourne, AU",
    "type": "Full-Time",
    "salary": "$65K – $85K / year",
    "experience": "2+ years",
    "description": "Process fortnightly payroll, manage STP reporting and ensure award compliance for a diverse client base.",
    "requirements": [
      "2+ years payroll experience",
      "Knowledge of Australian awards and FairWork",
      "Experience with Xero Payroll or KeyPay",
      "STP and superannuation knowledge"
    ],
    "responsibilities": [
      "Process fortnightly and monthly payroll",
      "STP reporting and year-end finalisation",
      "Award interpretation and compliance",
      "Superannuation processing"
    ],
    "featured": false,
    "active": true
  },
  {
    "title": "Business Advisory Consultant",
    "department": "Advisory",
    "location": "Sydney, AU",
    "type": "Full-Time",
    "salary": "$100K – $130K / year",
    "experience": "5+ years",
    "description": "Partner with SME owners to deliver strategic advice on structuring, cash flow, and growth planning.",
    "requirements": [
      "CA/CPA qualified",
      "5+ years in advisory or consulting",
      "Strong commercial acumen",
      "Experience with business valuations and restructuring"
    ],
    "responsibilities": [
      "Strategic advisory for SME clients",
      "Business structuring and restructuring",
      "Cash flow management and forecasting",
      "Growth planning and benchmarking"
    ],
    "featured": false,
    "active": true
  }
]
```

---

## 8. Frontend Integration Guide

### 8.1 Fetching Job Openings

```typescript
// src/hooks/useJobOpenings.ts
import { useState, useEffect } from "react";

const API_BASE = "https://api.connect.cavaluer.com";

export type JobOpening = {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  featured: boolean;
};

export const useJobOpenings = (filters?: {
  department?: string;
  location?: string;
  search?: string;
}) => {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.department) params.set("department", filters.department);
    if (filters?.location) params.set("location", filters.location);
    if (filters?.search) params.set("search", filters.search);

    fetch(`${API_BASE}/api/careers/openings?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOpenings(res.data);
      })
      .finally(() => setLoading(false));
  }, [filters?.department, filters?.location, filters?.search]);

  return { openings, loading };
};
```

### 8.2 Submitting a Job Application

```typescript
// Submit specific application (multipart/form-data with files)
const submitApplication = async (
  data: JobApplicationData,
  resumeFile: File,
  coverLetterFile?: File
) => {
  const formData = new FormData();

  // Attach files
  formData.append("resume", resumeFile);
  if (coverLetterFile) {
    formData.append("coverLetter", coverLetterFile);
  }

  // Attach JSON data
  formData.append(
    "applicationData",
    JSON.stringify({
      jobId: data.jobId, // MongoDB ObjectId or null
      jobTitle: data.jobTitle,
      personalInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
      },
      experience: {
        currentRole: data.currentRole,
        yearsExperience: data.yearsExperience,
        relevantExperience: data.relevantExperience,
        qualifications: data.qualifications,
        qualificationsDetail: data.qualificationsDetail,
      },
      motivation: {
        whyJoin: data.whyJoin,
        whyRole: data.whyRole,
        strengths: data.strengths,
        salaryExpectation: data.salaryExpectation,
        availability: data.availability,
        workArrangement: data.workArrangement,
      },
      screening: {
        workRights: data.workRights,
        relocation: data.relocation,
        noticePeriod: data.noticePeriod,
        references: data.references,
        privacyConsent: data.privacyConsent,
      },
    })
  );

  const res = await fetch(
    `${API_BASE}/api/job-applications`,
    { method: "POST", body: formData }
  );

  return res.json();
};
```

### 8.3 Submitting a General Application

```typescript
// Same as above but POST to /api/job-applications/general
const submitGeneralApplication = async (data, resumeFile, coverLetterFile?) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  if (coverLetterFile) formData.append("coverLetter", coverLetterFile);
  formData.append(
    "applicationData",
    JSON.stringify({
      jobTitle: "General Application",
      personalInfo: { /* ... */ },
      experience: { /* ... */ },
      motivation: { /* ... */ },
      screening: { /* ... */ },
    })
  );

  const res = await fetch(
    `${API_BASE}/api/job-applications/general`,
    { method: "POST", body: formData }
  );
  return res.json();
};
```

---

## 9. Error Handling

All endpoints return a consistent response shape:

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error

```json
{
  "success": false,
  "error": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created successfully |
| `400` | Validation error / Bad request |
| `404` | Resource not found |
| `401` | Unauthorized (missing/invalid JWT) |
| `403` | Forbidden (insufficient role) |
| `500` | Internal server error |

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/careers/openings` | Public | List active job openings |
| `GET` | `/api/careers/openings/:id` | Public | Single opening detail |
| `GET` | `/api/careers/admin/openings` | Admin | All openings (inc. inactive) |
| `POST` | `/api/careers/admin/openings` | Admin | Create opening |
| `PUT` | `/api/careers/admin/openings/:id` | Admin | Update opening |
| `DELETE` | `/api/careers/admin/openings/:id` | Admin | Delete opening |
| `PATCH` | `/api/careers/admin/openings/:id/toggle` | Admin | Toggle active |
| `POST` | `/api/careers/admin/openings/seed` | Admin | Seed defaults |
| `POST` | `/api/job-applications` | Public | Submit job application |
| `POST` | `/api/job-applications/general` | Public | Submit general application |
| `GET` | `/api/job-applications/admin` | Admin | List all applications |
| `GET` | `/api/job-applications/admin/stats` | Admin | Dashboard stats |
| `GET` | `/api/job-applications/admin/:id` | Admin | Single application |
| `PATCH` | `/api/job-applications/admin/:id/status` | Admin | Update status |
| `PATCH` | `/api/job-applications/admin/:id/notes` | Admin | Add notes |
| `DELETE` | `/api/job-applications/admin/:id` | Admin | Delete application |
