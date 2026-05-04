# Lab & Medical Reports Feature — Frontend Guide

**Base URL:** `http://localhost:3000/api/v1`

> This document covers the complete Lab Reports feature. Labs can register, login, search patients, and upload medical reports (X-Ray, MRI, CT Scan, etc.). Doctors can view a patient's lab reports from their existing workflow.

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [Authentication (Role-Based JWT)](#authentication-role-based-jwt)
- [Lab Auth Endpoints](#lab-auth-endpoints)
  - [Register Lab](#post-labauthregister)
  - [Login Lab](#post-labauthlogin)
- [Lab — Patient Search](#lab--patient-search)
  - [Search by Phone](#get-labpatientssearchphone)
  - [Get Patient by ID](#get-labpatientsid)
- [Lab — Report Management](#lab--report-management)
  - [Upload Report](#post-labreportsupload)
  - [List Lab Reports](#get-labreports)
  - [Get Single Report](#get-labreportsid)
  - [Delete Report](#delete-labreportsid)
- [Doctor — View Patient Reports](#doctor--view-patient-reports)
  - [Get Patient Reports](#get-patientsidreports)
- [Download Report File](#get-reportsiddownload)
- [Enums Reference](#enums-reference)
- [Frontend Implementation Guide](#frontend-implementation-guide)
- [Error Responses](#error-responses)

---

## Feature Overview

This feature introduces a **Lab** user role alongside the existing **Doctor** role.

**How it works:**
1. A lab registers and logs in (gets a JWT with `role: "lab"`)
2. Lab searches for a patient by phone number
3. Lab uploads medical reports (images or PDFs) for that patient
4. When a doctor views a patient, they can see all attached lab reports
5. Both doctors and labs can download report files

**Key points for frontend:**
- Labs and doctors use **separate login/register pages**
- Lab JWT tokens have `role: "lab"`, doctor tokens have `role: "doctor"`
- Lab endpoints are prefixed with `/lab/...`
- The existing doctor flow is unchanged — just a new "Reports" tab/section on the patient detail page

---

## Authentication (Role-Based JWT)

The system now uses role-based JWT tokens. The token payload includes a `role` field.

**Doctor token payload:** `{ sub: 1, email: "doctor@example.com", role: "doctor" }`
**Lab token payload:** `{ sub: 1, email: "lab@example.com", role: "lab" }`

Both use the same header format:
```
Authorization: Bearer <access_token>
```

**Important:** Lab tokens cannot access doctor endpoints and vice versa. The API returns `403 Forbidden` if the role doesn't match.

> Existing doctor login/register responses now also include `role: "doctor"` in the token. Old tokens without a role field still work and default to doctor.

---

## Lab Auth Endpoints

### `POST /lab/auth/register`

Register a new lab account.

#### Request Body

```json
{
  "name": "Popular Diagnostics",
  "email": "info@populardiag.com",
  "password": "securepassword",
  "phone": "+8801711000001",
  "address": "123 Lab Road, Dhanmondi, Dhaka",
  "license_no": "LAB-2026-001"
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Lab/diagnostic center name |
| `email` | string | Yes | Unique email (used for login) |
| `password` | string | Yes | Minimum 6 characters |
| `phone` | string | Yes | Contact phone number |
| `address` | string | Yes | Lab location/address |
| `license_no` | string | Yes | Lab license or registration number |

#### Response `201 Created`

```json
{
  "message": "Registration successful",
  "lab": {
    "id": 1,
    "name": "Popular Diagnostics",
    "email": "info@populardiag.com",
    "phone": "+8801711000001",
    "address": "123 Lab Road, Dhanmondi, Dhaka",
    "license_no": "LAB-2026-001"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Validation failed (missing/invalid fields) |
| `409 Conflict` | Lab with this email already exists |

---

### `POST /lab/auth/login`

Login with lab credentials.

#### Request Body

```json
{
  "email": "info@populardiag.com",
  "password": "securepassword"
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Account password |

#### Response `200 OK`

```json
{
  "message": "Login successful",
  "lab": {
    "id": 1,
    "name": "Popular Diagnostics",
    "email": "info@populardiag.com",
    "phone": "+8801711000001",
    "address": "123 Lab Road, Dhanmondi, Dhaka",
    "license_no": "LAB-2026-001"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Validation failed |
| `401 Unauthorized` | Invalid email or password |

---

## Lab — Patient Search

> **Auth required:** Lab JWT token

### `GET /lab/patients/search?phone=...`

Search for a patient by phone number. The lab uses this to find the patient before uploading a report.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Patient phone number (e.g. `+8801711000000`) |

#### Example

```
GET /api/v1/lab/patients/search?phone=+8801711000000
```

#### Response `200 OK`

```json
{
  "message": "Patient fetched successfully",
  "data": {
    "id": 1,
    "name": "Rahim Uddin",
    "age": 45,
    "gender": "male",
    "phone": "+8801711000000",
    "email": "rahim@example.com",
    "weight": "72.50",
    "created_at": "2026-04-04T10:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Not a lab token |
| `404 Not Found` | Patient with this phone number not found |

---

### `GET /lab/patients/:id`

Get a patient by their ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Patient ID |

#### Response `200 OK`

Same structure as the search response above.

---

## Lab — Report Management

> **Auth required:** Lab JWT token

### `POST /lab/reports/upload`

Upload a medical report for a patient. This endpoint uses **`multipart/form-data`** (not JSON).

#### Request (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | The report file. Allowed: JPEG, PNG, WebP, PDF. Max size: **10MB** |
| `patient_id` | number | Yes | ID of the patient |
| `report_type` | string | Yes | One of: `xray`, `mri`, `ct_scan`, `blood_test`, `ultrasound`, `other` |
| `title` | string | Yes | Report title (e.g. "Chest X-Ray", "Brain MRI") |
| `description` | string | No | Optional notes or findings from the lab |
| `report_date` | string | Yes | Date the test was performed. ISO format: `YYYY-MM-DD` (e.g. `2026-04-25`) |

#### Frontend Example (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', selectedFile);           // File object from input
formData.append('patient_id', '1');
formData.append('report_type', 'xray');
formData.append('title', 'Chest X-Ray');
formData.append('description', 'Normal findings');
formData.append('report_date', '2026-04-25');

const response = await fetch('http://localhost:3000/api/v1/lab/reports/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${labToken}`,
    // Do NOT set Content-Type — browser sets it automatically with boundary
  },
  body: formData,
});

const result = await response.json();
```

#### Frontend Example (Axios)

```javascript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('patient_id', patientId);
formData.append('report_type', 'mri');
formData.append('title', 'Brain MRI');
formData.append('report_date', '2026-04-25');

const { data } = await axios.post('/api/v1/lab/reports/upload', formData, {
  headers: {
    'Authorization': `Bearer ${labToken}`,
    'Content-Type': 'multipart/form-data',
  },
});
```

#### Response `201 Created`

```json
{
  "message": "Report uploaded successfully",
  "data": {
    "id": 1,
    "lab_id": 1,
    "patient_id": 1,
    "report_type": "xray",
    "title": "Chest X-Ray",
    "description": "Normal findings",
    "file_url": "/uploads/reports/a1b2c3d4-5678-90ab-cdef.jpg",
    "file_type": "image",
    "original_filename": "chest-xray.jpg",
    "report_date": "2026-04-25",
    "created_at": "2026-04-25T10:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | File is missing |
| `400 Bad Request` | Invalid file type (only JPEG, PNG, WebP, PDF allowed) |
| `400 Bad Request` | File too large (max 10MB) |
| `400 Bad Request` | Validation failed (missing required fields) |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Not a lab token |

---

### `GET /lab/reports`

List all reports uploaded by the currently logged-in lab. Sorted by newest first. Includes patient info.

#### Response `200 OK`

```json
{
  "message": "Reports fetched successfully",
  "data": [
    {
      "id": 2,
      "lab_id": 1,
      "patient_id": 1,
      "report_type": "mri",
      "title": "Brain MRI",
      "description": null,
      "file_url": "/uploads/reports/b2c3d4e5-6789-01ab-cdef.pdf",
      "file_type": "pdf",
      "original_filename": "brain-mri-report.pdf",
      "report_date": "2026-04-24",
      "created_at": "2026-04-25T11:00:00.000Z",
      "patient": {
        "id": 1,
        "name": "Rahim Uddin",
        "age": 45,
        "gender": "male",
        "phone": "+8801711000000",
        "email": "rahim@example.com",
        "weight": "72.50",
        "created_at": "2026-04-04T10:00:00.000Z"
      }
    },
    {
      "id": 1,
      "lab_id": 1,
      "patient_id": 1,
      "report_type": "xray",
      "title": "Chest X-Ray",
      "description": "Normal findings",
      "file_url": "/uploads/reports/a1b2c3d4-5678-90ab-cdef.jpg",
      "file_type": "image",
      "original_filename": "chest-xray.jpg",
      "report_date": "2026-04-25",
      "created_at": "2026-04-25T10:00:00.000Z",
      "patient": {
        "id": 1,
        "name": "Rahim Uddin",
        "age": 45,
        "gender": "male",
        "phone": "+8801711000000",
        "email": "rahim@example.com",
        "weight": "72.50",
        "created_at": "2026-04-04T10:00:00.000Z"
      }
    }
  ]
}
```

---

### `GET /lab/reports/:id`

Get a single report by ID. Includes both lab and patient details.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Report ID |

#### Response `200 OK`

```json
{
  "message": "Report fetched successfully",
  "data": {
    "id": 1,
    "lab_id": 1,
    "patient_id": 1,
    "report_type": "xray",
    "title": "Chest X-Ray",
    "description": "Normal findings",
    "file_url": "/uploads/reports/a1b2c3d4-5678-90ab-cdef.jpg",
    "file_type": "image",
    "original_filename": "chest-xray.jpg",
    "report_date": "2026-04-25",
    "created_at": "2026-04-25T10:00:00.000Z",
    "lab": {
      "id": 1,
      "name": "Popular Diagnostics",
      "email": "info@populardiag.com",
      "phone": "+8801711000001",
      "address": "123 Lab Road, Dhanmondi, Dhaka",
      "license_no": "LAB-2026-001",
      "created_at": "2026-04-20T08:00:00.000Z"
    },
    "patient": {
      "id": 1,
      "name": "Rahim Uddin",
      "age": 45,
      "gender": "male",
      "phone": "+8801711000000",
      "email": "rahim@example.com",
      "weight": "72.50",
      "created_at": "2026-04-04T10:00:00.000Z"
    }
  }
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Report not found |

---

### `DELETE /lab/reports/:id`

Delete a report. Only the lab that uploaded it can delete it. The file is also removed from the server.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Report ID |

#### Response `200 OK`

```json
{
  "message": "Report deleted successfully"
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Report not found or you are not the owner |

---

## Doctor — View Patient Reports

> **Auth required:** Doctor JWT token

### `GET /patients/:id/reports`

Get all medical reports for a specific patient. Returns reports from **all labs**, sorted by newest first. Each report includes the lab that uploaded it.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Patient ID |

#### Example

```
GET /api/v1/patients/1/reports
```

#### Response `200 OK`

```json
{
  "message": "Patient reports fetched successfully",
  "data": [
    {
      "id": 2,
      "lab_id": 1,
      "patient_id": 1,
      "report_type": "mri",
      "title": "Brain MRI",
      "description": null,
      "file_url": "/uploads/reports/b2c3d4e5-6789-01ab-cdef.pdf",
      "file_type": "pdf",
      "original_filename": "brain-mri-report.pdf",
      "report_date": "2026-04-24",
      "created_at": "2026-04-25T11:00:00.000Z",
      "lab": {
        "id": 1,
        "name": "Popular Diagnostics",
        "email": "info@populardiag.com",
        "phone": "+8801711000001",
        "address": "123 Lab Road, Dhanmondi, Dhaka",
        "license_no": "LAB-2026-001",
        "created_at": "2026-04-20T08:00:00.000Z"
      }
    },
    {
      "id": 1,
      "lab_id": 1,
      "patient_id": 1,
      "report_type": "xray",
      "title": "Chest X-Ray",
      "description": "Normal findings",
      "file_url": "/uploads/reports/a1b2c3d4-5678-90ab-cdef.jpg",
      "file_type": "image",
      "original_filename": "chest-xray.jpg",
      "report_date": "2026-04-25",
      "created_at": "2026-04-25T10:00:00.000Z",
      "lab": {
        "id": 1,
        "name": "Popular Diagnostics",
        "email": "info@populardiag.com",
        "phone": "+8801711000001",
        "address": "123 Lab Road, Dhanmondi, Dhaka",
        "license_no": "LAB-2026-001",
        "created_at": "2026-04-20T08:00:00.000Z"
      }
    }
  ]
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Patient not found |

---

## Download Report File

> **Auth required:** Any authenticated user (doctor or lab)

### `GET /reports/:id/download`

Download the actual report file (image or PDF). Returns the binary file with the original filename.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Report ID |

#### Frontend Examples

```javascript
// Option 1: Download file
const response = await fetch(`http://localhost:3000/api/v1/reports/${reportId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = report.original_filename;  // Use the filename from the report object
a.click();
window.URL.revokeObjectURL(url);

// Option 2: Preview image in new tab
const response = await fetch(`http://localhost:3000/api/v1/reports/${reportId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const blob = await response.blob();
window.open(window.URL.createObjectURL(blob), '_blank');

// Option 3: Display image inline
const response = await fetch(`http://localhost:3000/api/v1/reports/${reportId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const blob = await response.blob();
const imageUrl = window.URL.createObjectURL(blob);
// Use imageUrl as src for an <img> tag
```

#### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | File not found on server |
| `404 Not Found` | Report not found |

---

## Enums Reference

### Report Type

| Value | Display Name |
|-------|-------------|
| `xray` | X-Ray |
| `mri` | MRI |
| `ct_scan` | CT Scan |
| `blood_test` | Blood Test |
| `ultrasound` | Ultrasound |
| `other` | Other |

### File Type (auto-detected, read-only)

| Value | Description |
|-------|-------------|
| `image` | JPEG, PNG, or WebP file |
| `pdf` | PDF file |

### Allowed File Uploads

| MIME Type | Extension |
|-----------|-----------|
| `image/jpeg` | .jpg, .jpeg |
| `image/png` | .png |
| `image/webp` | .webp |
| `application/pdf` | .pdf |

**Max file size:** 10MB

---

## Frontend Implementation Guide

### 1. Lab Portal (New Pages)

You need to build a **separate lab portal** with these pages:

#### Lab Login Page (`/lab/login`)
- Email + password form
- Call `POST /lab/auth/login`
- Store `access_token` in localStorage/cookie (same as doctor flow)
- Redirect to lab dashboard

#### Lab Register Page (`/lab/register`)
- Form fields: name, email, password, phone, address, license_no
- Call `POST /lab/auth/register`
- Store token, redirect to lab dashboard

#### Lab Dashboard (`/lab/dashboard`)
- Show list of uploaded reports (`GET /lab/reports`)
- Each row: patient name, report title, report type, date, actions (view/delete)
- "Upload Report" button

#### Upload Report Page/Modal (`/lab/upload`)
- Step 1: Search patient by phone (`GET /lab/patients/search?phone=...`)
  - Show patient info card when found
  - Show "Patient not found" message if 404
- Step 2: Fill report form
  - File picker (accept: `.jpg,.jpeg,.png,.webp,.pdf`)
  - Report type dropdown (use enum values)
  - Title text input
  - Description textarea (optional)
  - Report date picker
- Step 3: Submit as `multipart/form-data` (`POST /lab/reports/upload`)
- Show success toast with report details

#### Report Detail Page (`/lab/reports/:id`)
- Show full report info (`GET /lab/reports/:id`)
- Preview image inline or show PDF viewer
- Download button (`GET /reports/:id/download`)
- Delete button (`DELETE /lab/reports/:id`)

### 2. Doctor Portal (Changes to Existing Pages)

Minimal changes needed:

#### Patient Detail Page — Add "Lab Reports" Tab
- When doctor views a patient, add a new tab/section: **"Lab Reports"**
- Call `GET /patients/:patientId/reports`
- Show a list/grid of reports:
  - Report title, type badge, lab name, report date
  - Thumbnail preview for images, PDF icon for PDFs
  - Click to view/download (`GET /reports/:id/download`)

#### Suggested UI for Report List Item

```
┌─────────────────────────────────────────────────────┐
│ 🩻 Chest X-Ray                          25 Apr 2026 │
│ X-Ray • Popular Diagnostics                          │
│ Normal findings                                      │
│                              [ 👁 View ] [ ⬇ Download ] │
└─────────────────────────────────────────────────────┘
```

### 3. Routing Suggestion

```
/lab/login          → Lab login page
/lab/register       → Lab registration page
/lab/dashboard      → Lab report list
/lab/upload         → Upload report (with patient search)
/lab/reports/:id    → Report detail

/patients/:id       → Existing patient detail (add "Lab Reports" tab)
```

### 4. Auth Token Storage

Since you now have two user types, consider storing the role alongside the token:

```javascript
// After login/register
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('user_role', 'lab');  // or 'doctor'
localStorage.setItem('user_data', JSON.stringify(response.lab));  // or response.doctor

// Route guard
const role = localStorage.getItem('user_role');
if (role === 'lab' && route.startsWith('/doctor')) redirect('/lab/dashboard');
if (role === 'doctor' && route.startsWith('/lab')) redirect('/dashboard');
```

### 5. File Upload Tips

```javascript
// File input with validation
<input
  type="file"
  accept=".jpg,.jpeg,.png,.webp,.pdf"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    setSelectedFile(file);
  }}
/>

// Determine preview type from file_type field
{report.file_type === 'image' ? (
  <img src={downloadUrl} alt={report.title} />
) : (
  <iframe src={downloadUrl} title={report.title} />
)}
```

---

## Error Responses

All error responses follow the standard NestJS format:

```json
{
  "statusCode": 400,
  "message": ["patient_id must be a number", "title should not be empty"],
  "error": "Bad Request"
}
```

Single-message errors:

```json
{
  "statusCode": 404,
  "message": "Patient with phone number +8801711000000 not found",
  "error": "Not Found"
}
```

Role-based access denied:

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**HTTP Status Codes Used:**

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — validation error or missing file |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — wrong role (e.g. doctor token on lab endpoint) |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate email |
