# Prescriptions API

**Base URL:** `http://localhost:3000/api/v1`

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prescriptions` | Create a new prescription |
| GET | `/prescriptions` | Get all prescriptions for the doctor |
| GET | `/prescriptions/recent` | Get the last 10 prescriptions for the doctor |
| GET | `/prescriptions?patientId={id}` | Get all prescriptions for a patient |
| GET | `/prescriptions/:id` | Get a single prescription |
| PATCH | `/prescriptions/:id` | Update a prescription |
| DELETE | `/prescriptions/:id` | Delete a prescription |

---

## POST `/prescriptions`

Create a new prescription with optional medicines.

### Request Body

```json
{
  "patient_id": 1,
  "chief_complaints": "Fever and headache for 3 days",
  "investigation": "CBC, Blood sugar",
  "diagnosis": "Viral fever",
  "advice": "Rest, drink plenty of fluids",
  "medicines": [
    {
      "medicine_name": "Paracetamol",
      "dosage": "500mg",
      "timing": "After meal",
      "duration": "5 days",
      "notes": "Take with water"
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | number | Yes | ID of the patient |
| `chief_complaints` | string | No | Patient's main complaints |
| `investigation` | string | No | Recommended tests/investigations |
| `diagnosis` | string | No | Doctor's diagnosis |
| `advice` | string | No | General advice for the patient |
| `medicines` | MedicineDto[] | No | List of prescribed medicines |

### Medicine Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `medicine_name` | string | Yes | Name of the medicine |
| `dosage` | string | Yes | Dosage amount (e.g., "500mg") |
| `timing` | string | Yes | When to take (e.g., "After meal") |
| `duration` | string | Yes | How long to take (e.g., "5 days") |
| `notes` | string | No | Additional notes |

### Response `201 Created`

```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Fever and headache for 3 days",
  "investigation": "CBC, Blood sugar",
  "diagnosis": "Viral fever",
  "advice": "Rest, drink plenty of fluids",
  "pdf_url": null,
  "created_at": "2026-04-04T10:00:00.000Z",
  "doctor": {
    "id": 1,
    "name": "Dr. Ahmed"
  },
  "patient": {
    "id": 1,
    "name": "John Doe"
  },
  "medicines": [
    {
      "id": 1,
      "prescription_id": 1,
      "medicine_name": "Paracetamol",
      "dosage": "500mg",
      "timing": "After meal",
      "duration": "5 days",
      "notes": "Take with water"
    }
  ]
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Patient not found |
| `404 Not Found` | Doctor not found |

---

## GET `/prescriptions`

Get all prescriptions belonging to the currently authenticated doctor (sorted by newest first).

### Response `200 OK`

```json
[
  {
    "id": 1,
    "doctor_id": 1,
    "patient_id": 1,
    "chief_complaints": "Fever and headache",
    "investigation": "CBC",
    "diagnosis": "Viral fever",
    "advice": "Rest",
    "pdf_url": null,
    "created_at": "2026-04-04T10:00:00.000Z",
    "doctor": { ... },
    "patient": { ... },
    "medicines": [ ... ]
  }
]
```

---

## GET `/prescriptions/recent`

Get the last 10 prescriptions for the currently authenticated doctor (sorted by newest first). Designed for dashboard/recent prescriptions widgets.

### Example

```
GET /api/v1/prescriptions/recent
```

### Response `200 OK`

Returns an array of up to 10 prescription objects (same shape as `GET /prescriptions`).

```json
[
  {
    "id": 12,
    "doctor_id": 1,
    "patient_id": 3,
    "chief_complaints": "Cough and cold",
    "investigation": "Chest X-ray",
    "diagnosis": "Bronchitis",
    "advice": "Avoid cold drinks",
    "pdf_url": null,
    "created_at": "2026-04-25T09:00:00.000Z",
    "doctor": { ... },
    "patient": { ... },
    "medicines": [ ... ]
  }
]
```

> **Note:** This endpoint always returns a maximum of 10 items. For the full list, use `GET /prescriptions`.

---

## GET `/prescriptions?patientId={id}`

Get all prescriptions for a specific patient (sorted by newest first).

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | number | Yes | ID of the patient |

### Example

```
GET /api/v1/prescriptions?patientId=5
```

### Response `200 OK`

Same structure as `GET /prescriptions` — returns an array of prescription objects.

---

## GET `/prescriptions/:id`

Get a single prescription by its ID.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Prescription ID |

### Response `200 OK`

```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Fever and headache",
  "investigation": "CBC",
  "diagnosis": "Viral fever",
  "advice": "Rest",
  "pdf_url": null,
  "created_at": "2026-04-04T10:00:00.000Z",
  "doctor": {
    "id": 1,
    "name": "Dr. Ahmed"
  },
  "patient": {
    "id": 1,
    "name": "John Doe"
  },
  "medicines": [
    {
      "id": 1,
      "prescription_id": 1,
      "medicine_name": "Paracetamol",
      "dosage": "500mg",
      "timing": "After meal",
      "duration": "5 days",
      "notes": "Take with water"
    }
  ]
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Prescription not found |

---

## PATCH `/prescriptions/:id`

Update an existing prescription. Only the doctor who created it can update it. Sending `medicines` **replaces** the entire medicines list (delete all + re-create).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Prescription ID |

### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "chief_complaints": "Updated complaints",
  "investigation": "Updated investigations",
  "diagnosis": "Updated diagnosis",
  "advice": "Updated advice",
  "medicines": [
    {
      "medicine_name": "Amoxicillin",
      "dosage": "250mg",
      "timing": "Before meal",
      "duration": "7 days",
      "notes": "Avoid alcohol"
    }
  ]
}
```

> **Note:** If `medicines` is included in the request body, **all existing medicines are deleted** and replaced with the new list.

### Response `200 OK`

Returns the updated prescription object (same shape as `GET /prescriptions/:id`).

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Prescription not found or the doctor is not the owner |

---

## DELETE `/prescriptions/:id`

Delete a prescription. Only the doctor who created it can delete it.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Prescription ID |

### Response `200 OK`

Returns an empty body `{}` on success.

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Prescription not found or the doctor is not the owner |

---

## Notes

- Authentication is not yet enforced. The `doctor_id` currently defaults to `1` until JWT auth is fully implemented.
- All list responses are sorted by `created_at` in **descending** order (newest first).
- All responses include the full nested `doctor`, `patient`, and `medicines` relations.
