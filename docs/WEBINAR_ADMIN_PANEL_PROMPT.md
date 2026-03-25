# Webinar Admin Panel — Implementation Prompt

> Copy-paste this prompt into your admin panel project to build the Webinar management section. It follows the **exact same pattern** as the Careers admin panel.

---

## Prompt

```
Create a "Webinars" admin page at /admin/webinars that follows the EXACT same layout, design, and structure as the existing Careers Management page (/admin/careers).

## Navigation
- Add "Webinars" to the left sidebar navigation (below Careers), with a video/play icon.

## Page Structure
- Page title: "Webinars Management"
- Subtitle: "Manage webinars and review registrations."
- Two tabs (same style as Careers): "Webinar List" and "Registrations"

---

## TAB 1: Webinar List

### Table Columns
| Column | Description |
|---|---|
| Title | Webinar title |
| Category | e.g. "Tax Compliance", "Business Growth" |
| Speaker | Speaker name |
| Date | Formatted date (e.g. 22 Mar 2026) |
| Duration | e.g. "60 Min" |
| Status | Badge: `draft` (grey), `published` (green), `cancelled` (red), `completed` (blue) |
| Featured | Toggle switch (orange, same as Careers) |
| Registrations | Count of registrations for this webinar |
| Actions | Edit (pencil icon) and Delete (trash icon) |

### "+ Add Webinar" Button (top-right, orange CTA, same as "+ Add Opening")
Opens a dialog/modal with these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Text input | ✅ | Webinar title |
| Category | Text input | ✅ | e.g. "Tax Compliance", "Superannuation" |
| Description | Textarea | ✅ | Short description (shown on card) |
| Long Description | Textarea | ❌ | Detailed description |
| Date | Date picker | ✅ | Webinar date |
| Time | Text input | ✅ | e.g. "2:00 PM AEST" |
| Duration | Text input | ✅ | e.g. "60 Min" |
| Speaker Name | Text input | ✅ | Speaker full name |
| Speaker Title | Text input | ❌ | e.g. "Senior Tax Advisor" |
| Speaker Bio | Textarea | ❌ | Short bio |
| Speaker Image | File upload | ❌ | Image upload (accepts jpg, png, webp) |
| Thumbnail Image | File upload | ❌ | Banner/thumbnail image |
| Video Link | Text input | ❌ | Zoom/Teams meeting link |
| Recording URL | Text input | ❌ | Post-event recording link |
| Learnings | Textarea (comma-separated) | ✅ | "You'll Learn" bullet points |
| Tags | Textarea (comma-separated) | ❌ | Search/filter tags |
| Max Seats | Number input | ❌ | Leave empty for unlimited |
| Featured | Toggle | ❌ | Default: off |
| Status | Dropdown | ✅ | Options: draft, published, cancelled, completed (default: draft) |

Modal footer: "Cancel" and "Create" buttons (same style as Careers).

### Edit Webinar
Same modal as Add, pre-filled with existing data. Button says "Update" instead of "Create".

### Delete Webinar
Confirmation dialog → calls DELETE API → removes from list.

### Toggle Featured
Clicking the toggle calls PATCH to update the `featured` field (same behavior as Careers featured toggle).

---

## TAB 2: Registrations

### Top-right filters (same layout as Careers Applications tab):
- Search input: "Search name/email..."
- Dropdown: "All Statuses" → registered, attended, no_show
- Dropdown: "All Webinars" → populated from webinar list

### Table Columns
| Column | Description |
|---|---|
| Registrant | Full name (firstName + lastName) |
| Email | Email address |
| Webinar Title | Title of the webinar they registered for |
| Company | Company name (if provided) |
| Phone | Phone number (if provided) |
| Status | Badge: `registered` (orange "New" style), `attended` (green), `no_show` (red) |
| Date | Registration date formatted |
| Actions | View (eye icon) and Delete (trash icon) |

### View Registration Detail
Clicking the eye icon opens a modal/dialog showing:
- Full registration details (name, email, phone, company)
- Webinar details (title, date, time)
- Registration status with ability to change status (dropdown: registered → attended / no_show)
- Admin notes field (editable textarea)
- Save button to update status and notes

### Delete Registration
Confirmation dialog → calls DELETE API → removes from list.

---

## API Endpoints to Use

### Webinar List Tab
- GET    `/api/admin/webinars` — List all webinars (supports ?status=&search=&page=&limit=)
- POST   `/api/admin/webinars` — Create webinar (multipart/form-data for image uploads)
- PUT    `/api/admin/webinars/:id` — Update webinar (multipart/form-data)
- DELETE `/api/admin/webinars/:id` — Delete webinar
- PATCH  `/api/admin/webinars/:id/status` — Toggle status `{ "status": "published" }`
- PATCH  `/api/admin/webinars/:id/featured` — Toggle featured `{ "featured": true }`

### Registrations Tab
- GET    `/api/admin/webinar-registrations` — List all registrations (supports ?webinarId=&status=&search=&page=&limit=)
- GET    `/api/admin/webinar-registrations/:id` — Get single registration detail
- PATCH  `/api/admin/webinar-registrations/:id` — Update registration status/notes `{ "status": "attended", "notes": "..." }`
- DELETE `/api/admin/webinar-registrations/:id` — Delete registration
- GET    `/api/admin/webinar-registrations/export/csv` — Export registrations as CSV (supports ?webinarId=&status=)

### API Base URL
Use the same API base URL as Careers: `https://api.connect.cavaluer.com`

All admin endpoints require the `authMiddleware` (same auth token as Careers).

---

## API Response Format

All endpoints return:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Create/Update Webinar — multipart/form-data fields:
- `title`, `description`, `longDescription`, `category`, `date`, `time`, `duration`
- `speaker`, `speakerTitle`, `speakerBio`
- `speakerImage` (file), `thumbnailImage` (file)
- `videoLink`, `recordingUrl`
- `learnings` (JSON stringified array, e.g. `'["Learn tax basics","Understand GST"]'`)
- `tags` (JSON stringified array)
- `maxSeats` (number or empty)
- `status` (draft/published/cancelled/completed)
- `featured` (boolean)

---

## Design Requirements
- Use the EXACT same color scheme, fonts, spacing, and component styles as the Careers page
- Orange CTA buttons (#F97316 or your existing CTA color)
- Same table styling with hover states
- Same toggle switch style for Featured
- Same badge/status styling
- Same modal/dialog styling with form layout
- Same sidebar active state (orange background with white text)
- Responsive: works on desktop and tablet
```

---

## Summary

This prompt will create an admin panel section for Webinars that mirrors the Careers section exactly, with:
- **Tab 1 (Webinar List)**: Full CRUD table with add/edit modal, status badges, featured toggle, registration count
- **Tab 2 (Registrations)**: Filterable table of all registrations with view detail, status management, and delete
- Same API patterns, auth, and UI components as the existing Careers admin
