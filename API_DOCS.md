# Doctor Digital Prescription — API Documentation

**Base URL:** `http://localhost:3000/api/v1`

> All request and response bodies use `Content-Type: application/json`.

---

## Table of Contents

- [Authentication](#authentication)
  - [Register](#post-authregister)
  - [Login](#post-authlogin)
- [Doctor](#doctor)
  - [Get All Doctors](#get-doctor)
- [Patients](#patients)
  - [Create Patient](#post-patients)
  - [Get All Patients](#get-patients)
- [Prescriptions](#prescriptions)
  - [Create Prescription](#post-prescriptions)
  - [Get All Prescriptions](#get-prescriptions)
  - [Get Prescriptions by Patient](#get-prescriptionspatientidpatientid)
  - [Get Single Prescription](#get-prescriptionsid)
  - [Update Prescription](#patch-prescriptionsid)
  - [Delete Prescription](#delete-prescriptionsid)
  - [Download Prescription PDF](#get-prescriptionsidpdf)
  - [Email Prescription to Patient](#post-prescriptionsidsend-email)
- [Dashboard](#dashboard)
  - [Get Stats](#get-apidashboardstats)
- [Lab Authentication](#lab-authentication)
  - [Register Lab](#post-labauthregister)
  - [Login Lab](#post-labauthlogin)
- [Lab — Patient Search](#lab--patient-search)
  - [Search by Phone](#get-labpatientssearchphone)
  - [Get by ID](#get-labpatientsid)
- [Lab — Medical Reports](#lab--medical-reports)
  - [Upload Report](#post-labreportsupload)
  - [List Lab Reports](#get-labreports)
  - [Get Single Report](#get-labreportsid)
  - [Delete Report](#delete-labreportsid)
- [Doctor — Patient Reports](#doctor--patient-reports)
  - [Get Patient Reports](#get-patientsidreports)
  - [Download Report File](#get-reportsiddownload)
- [Error Responses](#error-responses)

---

## Authentication

### `POST /auth/register`

Registers a new doctor and returns a JWT access token.

**Request Body**

| Field            | Type     | Required | Description                        |
|------------------|----------|----------|------------------------------------|
| `name`           | `string` | Yes      | Full name of the doctor            |
| `email`          | `string` | Yes      | Unique email address               |
| `password`       | `string` | Yes      | Minimum 6 characters               |
| `specialization` | `string` | Yes      | Medical specialization             |
| `bmdc_reg_no`    | `string` | Yes      | BMDC registration number           |
| `education`      | `string` | Yes      | Educational qualifications         |
| `doctor_chamber` | `string` | Yes      | Chamber/clinic address             |
| `visit_fee`      | `number` | Yes      | Consultation fee (positive number) |

**Example Request**

```json
{
  "name": "Dr. Tanvir Ahmed",
  "email": "tanvir@example.com",
  "password": "securepassword",
  "specialization": "Cardiology",
  "bmdc_reg_no": "BMDC-12345",
  "education": "MBBS, MD (Cardiology)",
  "doctor_chamber": "123 Medical Road, Dhaka",
  "visit_fee": 800
}
```

**Response `201 Created`**

```json
{
  "message": "Registration successful",
  "doctor": {
    "id": 1,
    "name": "Dr. Tanvir Ahmed",
    "email": "tanvir@example.com",
    "specialization": "Cardiology",
    "bmdc_reg_no": "BMDC-12345",
    "education": "MBBS, MD (Cardiology)",
    "doctor_chamber": "123 Medical Road, Dhaka",
    "visit_fee": 800
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Description                              |
|--------|------------------------------------------|
| `400`  | Validation failed (missing/invalid fields) |
| `409`  | Doctor with this email already exists    |

---

### `POST /auth/login`

Authenticates a doctor and returns a JWT access token.

**Request Body**

| Field      | Type     | Required | Description        |
|------------|----------|----------|--------------------|
| `email`    | `string` | Yes      | Registered email   |
| `password` | `string` | Yes      | Account password   |

**Example Request**

```json
{
  "email": "tanvir@example.com",
  "password": "securepassword"
}
```

**Response `200 OK`**

```json
{
  "message": "Login successful",
  "doctor": {
    "id": 1,
    "name": "Dr. Tanvir Ahmed",
    "email": "tanvir@example.com",
    "specialization": "Cardiology"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Description              |
|--------|--------------------------|
| `400`  | Validation failed        |
| `401`  | Invalid credentials      |

---

## Doctor

### `GET /doctor`

Returns a list of all registered doctors, sorted by newest first.

**Request Body** — None

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Dr. Tanvir Ahmed",
    "email": "tanvir@example.com",
    "specialization": "Cardiology",
    "bmdc_reg_no": "BMDC-12345",
    "education": "MBBS, MD (Cardiology)",
    "doctor_chamber": "123 Medical Road, Dhaka",
    "visit_fee": "800.00",
    "created_at": "2026-04-04T10:00:00.000Z"
  }
]
```

---

## Patients

### `POST /patients`

Creates a new patient record.

**Request Body**

| Field    | Type                           | Required | Description                          |
|----------|--------------------------------|----------|--------------------------------------|
| `name`   | `string`                       | Yes      | Full name of the patient             |
| `age`    | `number`                       | Yes      | Age in years                         |
| `gender` | `"male"` \| `"female"` \| `"other"` | Yes | Gender                          |
| `phone`  | `string`                       | Yes      | Unique phone number (E.164 format)   |
| `email`  | `string`                       | No       | Email address                        |
| `weight` | `number`                       | No       | Weight in kg (up to 2 decimal places) |

**Example Request**

```json
{
  "name": "Rahim Uddin",
  "age": 45,
  "gender": "male",
  "phone": "+8801711000000",
  "email": "rahim@example.com",
  "weight": 72.5
}
```

**Response `201 Created`**

```json
{
  "message": "Patient created successfully",
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

**Error Responses**

| Status | Description                                      |
|--------|--------------------------------------------------|
| `400`  | Validation failed (missing/invalid fields)       |
| `409`  | Patient with this phone number already exists    |

---

### `GET /patients`

Returns a list of all patients.

**Response `200 OK`**

```json
{
  "message": "Patients fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Rahim Uddin",
      "age": 45,
      "gender": "male",
      "phone": "+8801711000000",
      "email": "rahim@example.com",
      "weight": "72.50",
      "created_at": "2026-04-04T10:00:00.000Z"
    }
  ]
}
```

---

## Prescriptions

### `POST /prescriptions`

Creates a new prescription for a patient, including medicines.

**Request Body**

| Field               | Type              | Required | Description                          |
|---------------------|-------------------|----------|--------------------------------------|
| `patient_id`        | `number`          | Yes      | ID of the patient                    |
| `chief_complaints`  | `string`          | No       | Patient's chief complaints           |
| `investigation`     | `string`          | No       | Recommended investigations/tests    |
| `diagnosis`         | `string`          | No       | Diagnosis details                    |
| `advice`            | `string`          | No       | Doctor's advice                      |
| `medicines`         | `MedicineDto[]`   | No       | List of prescribed medicines         |

**`MedicineDto` fields**

| Field           | Type     | Required | Description                          |
|-----------------|----------|----------|--------------------------------------|
| `medicine_name` | `string` | Yes      | Name of the medicine                 |
| `dosage`        | `string` | Yes      | Dosage (e.g. `"500mg"`)              |
| `timing`        | `string` | Yes      | Timing (e.g. `"1+0+1"`, `"Morning"`) |
| `duration`      | `string` | Yes      | Duration (e.g. `"7 days"`)           |
| `notes`         | `string` | No       | Additional notes                     |

**Example Request**

```json
{
  "patient_id": 1,
  "chief_complaints": "Chest pain and shortness of breath",
  "investigation": "ECG, CBC, Blood sugar",
  "diagnosis": "Hypertension",
  "advice": "Low salt diet, avoid stress, regular exercise",
  "medicines": [
    {
      "medicine_name": "Amlodipine",
      "dosage": "5mg",
      "timing": "0+0+1",
      "duration": "30 days",
      "notes": "Take after dinner"
    },
    {
      "medicine_name": "Aspirin",
      "dosage": "75mg",
      "timing": "1+0+0",
      "duration": "30 days"
    }
  ]
}
```

**Response `201 Created`**

```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Chest pain and shortness of breath",
  "investigation": "ECG, CBC, Blood sugar",
  "diagnosis": "Hypertension",
  "advice": "Low salt diet, avoid stress, regular exercise",
  "pdf_url": null,
  "created_at": "2026-04-04T10:00:00.000Z",
  "doctor": {
    "id": 1,
    "name": "Dr. Tanvir Ahmed",
    "email": "tanvir@example.com",
    "specialization": "Cardiology"
  },
  "patient": {
    "id": 1,
    "name": "Rahim Uddin",
    "age": 45,
    "gender": "male",
    "phone": "+8801711000000"
  },
  "medicines": [
    {
      "id": 1,
      "prescription_id": 1,
      "medicine_name": "Amlodipine",
      "dosage": "5mg",
      "timing": "0+0+1",
      "duration": "30 days",
      "notes": "Take after dinner"
    },
    {
      "id": 2,
      "prescription_id": 1,
      "medicine_name": "Aspirin",
      "dosage": "75mg",
      "timing": "1+0+0",
      "duration": "30 days",
      "notes": null
    }
  ]
}
```

**Error Responses**

| Status | Description                  |
|--------|------------------------------|
| `400`  | Validation failed            |
| `404`  | Patient not found            |
| `404`  | Doctor not found             |

---

### `GET /prescriptions`

Returns all prescriptions for the current doctor.

**Response `200 OK`** — Array of prescription objects (same shape as the create response above).

---

### `GET /prescriptions?patientId={patientId}`

Returns all prescriptions for a specific patient.

**Query Parameters**

| Parameter   | Type     | Required | Description    |
|-------------|----------|----------|----------------|
| `patientId` | `number` | Yes      | ID of patient  |

**Example**

```
GET /prescriptions?patientId=1
```

**Response `200 OK`** — Array of prescription objects (same shape as the create response above).

---

### `GET /prescriptions/:id`

Returns a single prescription by ID.

**Path Parameters**

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| `id`      | `number` | Prescription ID      |

**Response `200 OK`** — Single prescription object (same shape as the create response above).

**Error Responses**

| Status | Description              |
|--------|--------------------------|
| `404`  | Prescription not found   |

---

### `PATCH /prescriptions/:id`

Updates an existing prescription. Only the fields you send will be updated. If `medicines` is included, all existing medicines are replaced with the new list.

**Path Parameters**

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| `id`      | `number` | Prescription ID      |

**Request Body** — All fields are optional (same fields as create).

**Example Request**

```json
{
  "diagnosis": "Hypertension Stage 2",
  "medicines": [
    {
      "medicine_name": "Amlodipine",
      "dosage": "10mg",
      "timing": "0+0+1",
      "duration": "30 days"
    }
  ]
}
```

**Response `200 OK`** — Updated prescription object (same shape as the create response above).

**Error Responses**

| Status | Description                           |
|--------|---------------------------------------|
| `400`  | Validation failed                     |
| `404`  | Prescription not found or unauthorized |

---

### `DELETE /prescriptions/:id`

Deletes a prescription by ID.

**Path Parameters**

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| `id`      | `number` | Prescription ID      |

**Response `200 OK`** — No body returned.

**Error Responses**

| Status | Description                           |
|--------|---------------------------------------|
| `404`  | Prescription not found or unauthorized |

---

### `GET /prescriptions/:id/pdf`

Downloads the prescription as a PDF file. The response is a binary PDF — not JSON.

**Path Parameters**

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| `id`      | `number` | Prescription ID      |

**Response `200 OK`**

Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription-{id}.pdf"
```

**Error Responses**

| Status | Description              |
|--------|--------------------------|
| `404`  | Prescription not found   |

---

### `POST /prescriptions/:id/send-email`

Sends the prescription PDF as an email attachment to the patient. Uses the patient's email by default, or a custom email if provided.

**Path Parameters**

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| `id`      | `number` | Prescription ID      |

**Request Body** (optional)

| Field   | Type     | Required | Description                                    |
|---------|----------|----------|------------------------------------------------|
| `email` | `string` | No       | Override recipient email (uses patient email if omitted) |

**Example Request**

```json
{
  "email": "custom@example.com"
}
```

**Response `200 OK`**

```json
{
  "message": "Prescription sent successfully",
  "recipient": "patient@example.com",
  "sent_at": "2026-04-24T10:30:00.000Z"
}
```

**Error Responses**

| Status | Description                                          |
|--------|------------------------------------------------------|
| `404`  | Prescription not found or unauthorized               |
| `404`  | No email found (patient has no email, none provided) |

---

## Dashboard

### `GET /api/dashboard/stats`

Returns key statistics for the logged-in doctor's dashboard.

**Response `200 OK`**

```json
{
  "message": "Dashboard statistics fetched successfully",
  "data": {
    "today_patients": 5,
    "today_income": 4000,
    "total_patients": 120,
    "total_earning": 96000
  }
}
```

| Field            | Type     | Description                                               |
|------------------|----------|-----------------------------------------------------------|
| `today_patients` | `number` | Number of new patients registered today                   |
| `today_income`   | `number` | Sum of visit fees from prescriptions issued today         |
| `total_patients` | `number` | Total number of patients in the system                    |
| `total_earning`  | `number` | Sum of visit fees across all prescriptions by this doctor |

---

## Lab Authentication

### `POST /lab/auth/register`

Registers a new lab and returns a JWT access token with `role: "lab"`.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Lab name |
| `email` | `string` | Yes | Unique email address |
| `password` | `string` | Yes | Minimum 6 characters |
| `phone` | `string` | Yes | Contact phone number |
| `address` | `string` | Yes | Lab location/address |
| `license_no` | `string` | Yes | Lab license/registration number |

**Example Request**

```json
{
  "name": "Popular Diagnostics",
  "email": "info@populardiag.com",
  "password": "securepassword",
  "phone": "+8801711000001",
  "address": "123 Lab Road, Dhaka",
  "license_no": "LAB-2026-001"
}
```

**Response `201 Created`**

```json
{
  "message": "Registration successful",
  "lab": {
    "id": 1,
    "name": "Popular Diagnostics",
    "email": "info@populardiag.com",
    "phone": "+8801711000001",
    "address": "123 Lab Road, Dhaka",
    "license_no": "LAB-2026-001"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Description |
|--------|-------------|
| `400` | Validation failed |
| `409` | Lab with this email already exists |

---

### `POST /lab/auth/login`

Authenticates a lab and returns a JWT access token.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Registered email |
| `password` | `string` | Yes | Account password |

**Response `200 OK`**

```json
{
  "message": "Login successful",
  "lab": {
    "id": 1,
    "name": "Popular Diagnostics",
    "email": "info@populardiag.com",
    "phone": "+8801711000001",
    "address": "123 Lab Road, Dhaka",
    "license_no": "LAB-2026-001"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Description |
|--------|-------------|
| `400` | Validation failed |
| `401` | Invalid credentials |

---

## Lab — Patient Search

> Requires lab JWT token: `Authorization: Bearer <lab_access_token>`

### `GET /lab/patients/search?phone=...`

Search for a patient by phone number.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | Yes | Patient phone number |

**Response `200 OK`**

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

---

### `GET /lab/patients/:id`

Get a patient by ID.

**Response `200 OK`** — Same structure as search above.

---

## Lab — Medical Reports

> Requires lab JWT token: `Authorization: Bearer <lab_access_token>`

### `POST /lab/reports/upload`

Upload a medical report for a patient. Uses `multipart/form-data`.

**Request (multipart/form-data)**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `file` | Yes | JPEG, PNG, WebP, or PDF. Max 10MB |
| `patient_id` | `number` | Yes | Patient ID |
| `report_type` | `string` | Yes | `xray`, `mri`, `ct_scan`, `blood_test`, `ultrasound`, or `other` |
| `title` | `string` | Yes | Report title (e.g. "Chest X-Ray") |
| `description` | `string` | No | Optional notes |
| `report_date` | `string` | Yes | ISO date (e.g. `2026-04-25`) |

**Response `201 Created`**

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
    "file_url": "/uploads/reports/a1b2c3d4-e5f6.jpg",
    "file_type": "image",
    "original_filename": "chest-xray.jpg",
    "report_date": "2026-04-25",
    "created_at": "2026-04-25T10:00:00.000Z"
  }
}
```

---

### `GET /lab/reports`

List all reports uploaded by this lab, sorted by newest first. Includes patient info.

**Response `200 OK`**

```json
{
  "message": "Reports fetched successfully",
  "data": [
    {
      "id": 1,
      "report_type": "xray",
      "title": "Chest X-Ray",
      "file_type": "image",
      "report_date": "2026-04-25",
      "created_at": "2026-04-25T10:00:00.000Z",
      "patient": { "id": 1, "name": "Rahim Uddin", "phone": "+8801711000000" }
    }
  ]
}
```

---

### `GET /lab/reports/:id`

Get a single report with lab and patient details.

**Response `200 OK`** — Full report object with `lab` and `patient` relations.

---

### `DELETE /lab/reports/:id`

Delete a report. Only the lab that uploaded it can delete it. Also removes the file from disk.

**Response `200 OK`**

```json
{ "message": "Report deleted successfully" }
```

**Error Responses**

| Status | Description |
|--------|-------------|
| `404` | Report not found or unauthorized |

---

## Doctor — Patient Reports

> Requires doctor JWT token: `Authorization: Bearer <doctor_access_token>`

### `GET /patients/:id/reports`

Get all medical reports for a specific patient. Returns reports from all labs, sorted by newest first.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | Patient ID |

**Response `200 OK`**

```json
{
  "message": "Patient reports fetched successfully",
  "data": [
    {
      "id": 1,
      "report_type": "xray",
      "title": "Chest X-Ray",
      "description": "Normal findings",
      "file_url": "/uploads/reports/a1b2c3d4-e5f6.jpg",
      "file_type": "image",
      "original_filename": "chest-xray.jpg",
      "report_date": "2026-04-25",
      "created_at": "2026-04-25T10:00:00.000Z",
      "lab": { "id": 1, "name": "Popular Diagnostics" }
    }
  ]
}
```

---

### `GET /reports/:id/download`

Download a report file. Accessible by any authenticated user (doctor or lab).

**Response `200 OK`** — Binary file download with original filename.

---

## Error Responses

All error responses follow NestJS's default format:

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "email must be an email"],
  "error": "Bad Request"
}
```

For single-message errors (e.g. 401, 404, 409):

```json
{
  "statusCode": 409,
  "message": "Patient with this phone number already exists",
  "error": "Conflict"
}
```

**Common HTTP status codes used:**

| Code  | Meaning                                    |
|-------|--------------------------------------------|
| `200` | OK                                         |
| `201` | Created                                    |
| `400` | Bad Request — validation error             |
| `401` | Unauthorized — invalid credentials         |
| `404` | Not Found — resource does not exist        |
| `409` | Conflict — duplicate email/phone           |

---

> **Note for frontend team:** JWT authentication guards on prescription endpoints are not yet enforced. The API currently uses a temporary `doctorId = 1` fallback. Once auth guards are wired up, you will need to send the `access_token` from login/register as a Bearer token in the `Authorization` header:
> ```
> Authorization: Bearer <access_token>
> ```
