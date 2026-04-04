# Patients API

**Base URL:** `http://localhost:3000/api/v1`

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create a new patient |
| GET | `/patients` | Get all patients |

---

## POST `/patients`

Create a new patient record.

### Request Body

```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "phone": "+8801712345678",
  "email": "john.doe@example.com",
  "weight": 72.5
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name of the patient |
| `age` | number | Yes | Age of the patient |
| `gender` | string (enum) | Yes | One of: `male`, `female`, `other` |
| `phone` | string | Yes | Phone number in international format (must be unique) |
| `email` | string | No | Email address of the patient |
| `weight` | number | No | Weight of the patient in kg |

### Response `201 Created`

```json
{
  "message": "Patient created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "age": 35,
    "gender": "male",
    "phone": "+8801712345678",
    "email": "john.doe@example.com",
    "weight": "72.50",
    "created_at": "2026-04-04T10:00:00.000Z",
    "prescriptions": []
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `409 Conflict` | Patient with this phone number already exists |
| `400 Bad Request` | Validation failed (invalid field types, missing required fields, invalid phone/email format) |

---

## GET `/patients`

Get all patients (sorted by newest first).

### Response `200 OK`

```json
{
  "message": "Patients fetched successfully",
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "age": 28,
      "gender": "female",
      "phone": "+8801987654321",
      "email": "jane.smith@example.com",
      "weight": "58.00",
      "created_at": "2026-04-04T11:00:00.000Z",
      "prescriptions": []
    },
    {
      "id": 1,
      "name": "John Doe",
      "age": 35,
      "gender": "male",
      "phone": "+8801712345678",
      "email": null,
      "weight": null,
      "created_at": "2026-04-04T10:00:00.000Z",
      "prescriptions": []
    }
  ]
}
```

---

## Gender Enum

| Value | Description |
|-------|-------------|
| `male` | Male |
| `female` | Female |
| `other` | Other |

---

## Notes

- The `phone` field must be unique across all patients. A `409 Conflict` is returned if a duplicate is found.
- The `phone` field must be a valid international phone number (e.g., `+8801712345678`).
- The `weight` field is stored as a decimal with precision `5,2` (e.g., `72.50`).
- All responses include the nested `prescriptions` relation.
