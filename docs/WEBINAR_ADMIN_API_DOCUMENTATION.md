# Webinar Admin Panel & API Documentation

## Overview

The Webinar module provides a public-facing webinar listing page and a registration system, backed by admin CRUD APIs for managing webinars and viewing submissions. The admin panel mirrors the Careers section with two tabs: **Webinar List** (CRUD) and **Submissions** (registrations).

---

## Database Schema

### Collection: `webinars`

| Field             | Type       | Required | Description                                      |
|-------------------|------------|----------|--------------------------------------------------|
| `_id`             | ObjectId   | auto     | Unique identifier                                |
| `title`           | String     | Yes      | Webinar title                                    |
| `description`     | String     | Yes      | Short description (shown on card)                |
| `longDescription` | String     | No       | Detailed description (shown on detail/modal)     |
| `category`        | String     | Yes      | e.g. "Tax Compliance", "Tax Planning", "Superannuation" |
| `date`            | Date       | Yes      | Webinar date (ISO 8601)                          |
| `time`            | String     | Yes      | Display time e.g. "2:00 PM AEST"                |
| `duration`        | String     | Yes      | e.g. "60 Min", "45 Min"                         |
| `speaker`         | String     | Yes      | Speaker full name                                |
| `speakerTitle`    | String     | No       | Speaker designation e.g. "Senior Tax Advisor"    |
| `speakerBio`      | String     | No       | Short speaker bio                                |
| `speakerImage`    | String     | No       | Speaker photo URL                                |
| `videoLink`       | String     | No       | Video/meeting link (Zoom, Teams, etc.)           |
| `thumbnailImage`  | String     | No       | Webinar thumbnail/banner image URL               |
| `learnings`       | [String]   | Yes      | Array of "You'll Learn" bullet points            |
| `tags`            | [String]   | No       | Search/filter tags                               |
| `maxSeats`        | Number     | No       | Maximum registrations allowed (null = unlimited) |
| `status`          | String     | Yes      | `draft` / `published` / `cancelled` / `completed`|
| `featured`        | Boolean    | No       | Show as featured webinar (default: false)        |
| `recordingUrl`    | String     | No       | Post-event recording URL                         |
| `resourceLinks`   | [Object]   | No       | Downloadable resources `{ label, url }`          |
| `createdAt`       | Date       | auto     | Creation timestamp                               |
| `updatedAt`       | Date       | auto     | Last update timestamp                            |

### Collection: `webinar_registrations`

| Field           | Type     | Required | Description                            |
|-----------------|----------|----------|----------------------------------------|
| `_id`           | ObjectId | auto     | Unique identifier                      |
| `webinarId`     | ObjectId | Yes      | Reference to `webinars._id`            |
| `firstName`     | String   | Yes      | Registrant first name                  |
| `lastName`      | String   | Yes      | Registrant last name                   |
| `email`         | String   | Yes      | Registrant email                       |
| `phone`         | String   | No       | Phone number                           |
| `company`       | String   | No       | Company / Organization                 |
| `status`        | String   | Yes      | `registered` / `attended` / `no_show`  |
| `registeredAt`  | Date     | auto     | Registration timestamp                 |
| `attendedAt`    | Date     | No       | When they joined the webinar           |
| `notes`         | String   | No       | Admin notes                            |

---

## API Endpoints

### Public APIs (No Auth Required)

#### 1. List Published Webinars
```
GET /api/webinars
```
**Query Params:**
| Param      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `category` | String | Filter by category                       |
| `status`   | String | Default: `published`                     |
| `upcoming` | Boolean| If true, only return webinars with date >= today |
| `page`     | Number | Pagination page (default: 1)             |
| `limit`    | Number | Items per page (default: 10)             |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "GST, BAS & Indirect Tax Compliance Made Simple",
      "description": "...",
      "category": "Tax Compliance",
      "date": "2025-01-21T00:00:00.000Z",
      "time": "2:00 PM AEST",
      "duration": "60 Min",
      "speaker": "Sarah Chen",
      "speakerTitle": "Senior Tax Advisor",
      "speakerImage": "https://...",
      "thumbnailImage": "https://...",
      "videoLink": null,
      "learnings": ["Master GST compliance requirements", "..."],
      "registered": 156,
      "maxSeats": 200,
      "status": "published",
      "featured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### 2. Get Single Webinar
```
GET /api/webinars/:id
```

#### 3. Register for Webinar
```
POST /api/webinars/:id/register
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "04XX XXX XXX",
  "company": "Acme Corp"
}
```
**Validations:**
- `firstName`, `lastName`, `email` are required
- Email must be valid format
- Check duplicate registration (same email + webinarId)
- Check if maxSeats reached

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "_id": "...",
    "webinarId": "...",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "status": "registered",
    "registeredAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Admin APIs (Auth Required)

#### 4. List All Webinars (Admin)
```
GET /api/admin/webinars
```
**Query Params:**
| Param    | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| `status` | String | Filter: `all` / `draft` / `published` / `cancelled` / `completed` |
| `page`   | Number | Pagination page                                  |
| `limit`  | Number | Items per page                                   |
| `search` | String | Search by title                                  |

**Response:** Same as public list but includes all statuses + registration counts.

#### 5. Create Webinar
```
POST /api/admin/webinars
Content-Type: multipart/form-data
```
**Body (form-data):**
| Field             | Type   | Required | Description                          |
|-------------------|--------|----------|--------------------------------------|
| `title`           | String | Yes      | Webinar title                        |
| `description`     | String | Yes      | Short description                    |
| `longDescription` | String | No       | Detailed description                 |
| `category`        | String | Yes      | Category name                        |
| `date`            | String | Yes      | ISO date string                      |
| `time`            | String | Yes      | Display time                         |
| `duration`        | String | Yes      | Duration string                      |
| `speaker`         | String | Yes      | Speaker name                         |
| `speakerTitle`    | String | No       | Speaker designation                  |
| `speakerBio`      | String | No       | Speaker bio                          |
| `speakerImage`    | File   | No       | Speaker photo (jpg/png, max 2MB)     |
| `thumbnailImage`  | File   | No       | Webinar banner/thumbnail (jpg/png, max 5MB) |
| `videoLink`       | String | No       | Zoom/Teams/YouTube link              |
| `learnings`       | String | Yes      | JSON stringified array of strings    |
| `tags`            | String | No       | JSON stringified array of strings    |
| `maxSeats`        | Number | No       | Seat limit                           |
| `status`          | String | No       | Default: `draft`                     |
| `featured`        | Boolean| No       | Default: false                       |
| `recordingUrl`    | String | No       | Post-event recording URL             |
| `resourceLinks`   | String | No       | JSON stringified `[{label, url}]`    |

**Response (201):**
```json
{
  "success": true,
  "message": "Webinar created successfully",
  "data": { /* full webinar object */ }
}
```

#### 6. Update Webinar
```
PUT /api/admin/webinars/:id
Content-Type: multipart/form-data
```
Same fields as Create. Only provided fields are updated.

#### 7. Delete Webinar
```
DELETE /api/admin/webinars/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Webinar deleted successfully"
}
```

#### 8. List Registrations for a Webinar
```
GET /api/admin/webinars/:id/registrations
```
**Query Params:**
| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `status` | String | Filter: `all` / `registered` / `attended` / `no_show` |
| `page`   | Number | Pagination page                          |
| `limit`  | Number | Items per page                           |
| `search` | String | Search by name or email                  |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "webinarId": "...",
      "webinarTitle": "GST, BAS & Indirect Tax Compliance Made Simple",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "04XX XXX XXX",
      "company": "Acme Corp",
      "status": "registered",
      "registeredAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 156, "pages": 8 }
}
```

#### 9. List All Registrations (All Webinars)
```
GET /api/admin/webinar-registrations
```
**Query Params:**
| Param       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `webinarId` | String | Filter by specific webinar               |
| `status`    | String | Filter: `all` / `registered` / `attended` / `no_show` |
| `page`      | Number | Pagination page                          |
| `limit`     | Number | Items per page                           |
| `search`    | String | Search by name, email, or webinar title  |

#### 10. Update Registration Status
```
PUT /api/admin/webinar-registrations/:id
```
**Body:**
```json
{
  "status": "attended",
  "notes": "Attended full session"
}
```

#### 11. Delete Registration
```
DELETE /api/admin/webinar-registrations/:id
```

#### 12. Export Registrations (CSV)
```
GET /api/admin/webinars/:id/registrations/export
```
Returns CSV file with all registration data for the webinar.

---

## Admin Panel UI Specification

### Location
`/admin/webinars` — Two tabs: **Webinar List** and **Submissions**

### Tab 1: Webinar List

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| **Table Columns**    | Thumbnail (small preview), Title, Category, Date, Time, Speaker, Status (badge), Registered Count, Actions |
| **Status Badges**    | `draft` (gray), `published` (green), `cancelled` (red), `completed` (blue) |
| **Actions**          | Edit (pencil icon), Delete (trash icon with confirmation), Toggle Status |
| **Search**           | Search by title                                                |
| **Filter**           | Filter by status dropdown                                      |
| **Add Webinar**      | Button opens a form/modal with all fields from Create API      |
| **Image Upload**     | Thumbnail image and Speaker image with preview                 |
| **Video Link**       | Input field for Zoom/Teams/YouTube meeting link                |
| **Recording URL**    | Input field for post-event recording URL                       |
| **Resource Links**   | Dynamic add/remove fields for `{ label, url }` pairs          |
| **Learnings**        | Dynamic add/remove text inputs for bullet points              |
| **Tags**             | Comma-separated or chip-style input                            |

### Tab 2: Submissions (Registrations)

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| **Table Columns**    | Name (first + last), Email, Phone, Company, Webinar Title, Status (badge), Registered Date, Actions |
| **Status Badges**    | `registered` (blue), `attended` (green), `no_show` (red)      |
| **Actions**          | Update Status (dropdown), Delete, View Details                 |
| **Filters**          | Filter by webinar (dropdown), Filter by status                 |
| **Search**           | Search by name or email                                        |
| **Export**           | Export CSV button per webinar                                   |
| **Bulk Actions**     | Mark selected as attended / no_show                            |

---

## Backend Implementation Notes

### Route Mounting (app.js)
```javascript
const webinarRoutes = require('./routes/webinarRoutes');
const adminWebinarRoutes = require('./routes/adminWebinarRoutes');

app.use('/api/webinars', webinarRoutes);
app.use('/api/admin/webinars', authMiddleware, adminWebinarRoutes);
app.use('/api/admin/webinar-registrations', authMiddleware, adminWebinarRegRoutes);
```

### File Upload (multer)
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/webinars/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### Mongoose Models

```javascript
// models/Webinar.js
const webinarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: String,
  category: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  speaker: { type: String, required: true },
  speakerTitle: String,
  speakerBio: String,
  speakerImage: String,
  videoLink: String,
  thumbnailImage: String,
  learnings: [{ type: String }],
  tags: [{ type: String }],
  maxSeats: Number,
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  featured: { type: Boolean, default: false },
  recordingUrl: String,
  resourceLinks: [{
    label: String,
    url: String
  }]
}, { timestamps: true });

// Virtual: registered count
webinarSchema.virtual('registered', {
  ref: 'WebinarRegistration',
  localField: '_id',
  foreignField: 'webinarId',
  count: true
});

module.exports = mongoose.model('Webinar', webinarSchema);
```

```javascript
// models/WebinarRegistration.js
const registrationSchema = new mongoose.Schema({
  webinarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webinar', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  status: {
    type: String,
    enum: ['registered', 'attended', 'no_show'],
    default: 'registered'
  },
  attendedAt: Date,
  notes: String
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ webinarId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('WebinarRegistration', registrationSchema);
```

---

## Frontend Integration Notes

Once the APIs are live, update `src/pages/WebinarPage.tsx`:

1. Replace the static `WEBINARS` array with a fetch to `GET /api/webinars?upcoming=true`
2. Replace the simulated registration submit with a `POST /api/webinars/:id/register`
3. Use the `registered` virtual count from the API response
4. Show `thumbnailImage` and `speakerImage` from API data
5. Use `videoLink` for a "Join Webinar" button (visible only on webinar day)
6. Show `recordingUrl` for completed webinars as "Watch Recording"
