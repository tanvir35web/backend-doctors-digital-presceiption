# Prescription Update/Edit API — Frontend Guide

**Base URL:** `http://localhost:3000/api/v1`

> This document covers the prescription edit/update feature. After reviewing a patient's lab reports, the doctor can update the diagnosis, add/remove medicines, change advice, etc.

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [Update Prescription Endpoint](#update-prescription-endpoint)
- [Request Fields](#request-fields)
- [Medicine Object](#medicine-object)
- [Usage Examples](#usage-examples)
  - [Update Only Diagnosis](#1-update-only-diagnosis)
  - [Add New Medicines (Replace All)](#2-add-new-medicines-replace-all)
  - [Update Multiple Fields After Reviewing Lab Reports](#3-update-multiple-fields-after-reviewing-lab-reports)
  - [Clear a Field](#4-clear-a-field)
  - [Update Advice Only](#5-update-advice-only)
- [Full Response Example](#full-response-example)
- [Error Responses](#error-responses)
- [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Feature Overview

The doctor can edit/update any existing prescription they created. This is especially useful after reviewing a patient's lab reports (X-Ray, MRI, blood tests, etc.) — the doctor may need to:

- Update the diagnosis based on lab findings
- Add new medicines or change dosages
- Update investigation notes
- Change advice for the patient

**Key behavior:**
- Only the doctor who created the prescription can update it
- All fields are optional — send only what you want to change
- If `medicines` is included, it **replaces the entire medicines list** (old medicines are deleted, new ones are created)
- If `medicines` is NOT included, existing medicines remain unchanged
- The response returns the full updated prescription with all relations

---

## Update Prescription Endpoint

### `PATCH /prescriptions/:id`

> **Auth required:** Doctor JWT token
> ```
> Authorization: Bearer <doctor_access_token>
> ```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Prescription ID |

---

## Request Fields

All fields are optional. Only include the fields you want to update.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chief_complaints` | string | No | Patient's chief complaints |
| `investigation` | string | No | Recommended tests/investigations |
| `diagnosis` | string | No | Doctor's diagnosis |
| `advice` | string | No | General advice for the patient |
| `medicines` | MedicineDto[] | No | Full list of medicines (replaces all existing) |

> **Important:** `patient_id` cannot be changed after creation.

---

## Medicine Object

When including `medicines` in the update, provide the **complete list** of medicines you want the prescription to have. All existing medicines will be deleted and replaced.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `medicine_name` | string | Yes | Name of the medicine |
| `dosage` | string | Yes | Dosage (e.g. `"500mg"`, `"10mg"`) |
| `timing` | string | Yes | When to take (e.g. `"1+0+1"`, `"After meal"`, `"Morning"`) |
| `duration` | string | Yes | How long (e.g. `"7 days"`, `"30 days"`, `"2 weeks"`) |
| `notes` | string | No | Additional notes (e.g. `"Take after dinner"`) |

---

## Usage Examples

### 1. Update Only Diagnosis

```json
PATCH /api/v1/prescriptions/1

{
  "diagnosis": "Hypertension Stage 2"
}
```

Medicines and other fields remain unchanged.

---

### 2. Add New Medicines (Replace All)

When you send `medicines`, the entire list is replaced. So include ALL medicines the prescription should have — not just the new ones.

```json
PATCH /api/v1/prescriptions/1

{
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
    },
    {
      "medicine_name": "Losartan",
      "dosage": "50mg",
      "timing": "1+0+0",
      "duration": "30 days",
      "notes": "Newly added after reviewing lab reports"
    }
  ]
}
```

---

### 3. Update Multiple Fields After Reviewing Lab Reports

A typical scenario: doctor reviews an MRI report, then updates the prescription.

```json
PATCH /api/v1/prescriptions/1

{
  "diagnosis": "Hypertension Stage 2 (confirmed by Brain MRI)",
  "investigation": "ECG, CBC, Blood sugar, Brain MRI — completed",
  "advice": "Low salt diet, avoid stress, regular exercise, follow-up in 2 weeks",
  "medicines": [
    {
      "medicine_name": "Amlodipine",
      "dosage": "10mg",
      "timing": "0+0+1",
      "duration": "30 days",
      "notes": "Dosage increased from 5mg based on MRI findings"
    },
    {
      "medicine_name": "Aspirin",
      "dosage": "75mg",
      "timing": "1+0+0",
      "duration": "30 days"
    },
    {
      "medicine_name": "Losartan",
      "dosage": "50mg",
      "timing": "1+0+0",
      "duration": "30 days",
      "notes": "New — added after reviewing lab reports"
    }
  ]
}
```

---

### 4. Clear a Field

Send an empty string to clear a text field:

```json
PATCH /api/v1/prescriptions/1

{
  "investigation": ""
}
```

Send an empty array to remove all medicines:

```json
PATCH /api/v1/prescriptions/1

{
  "medicines": []
}
```

---

### 5. Update Advice Only

```json
PATCH /api/v1/prescriptions/1

{
  "advice": "Stop smoking, reduce salt intake, walk 30 minutes daily"
}
```

---

## Full Response Example

### Response `200 OK`

The response always returns the full prescription with all relations, regardless of what was updated.

```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Chest pain and shortness of breath",
  "investigation": "ECG, CBC, Blood sugar, Brain MRI — completed",
  "diagnosis": "Hypertension Stage 2 (confirmed by Brain MRI)",
  "advice": "Low salt diet, avoid stress, regular exercise, follow-up in 2 weeks",
  "pdf_url": null,
  "created_at": "2026-04-04T10:00:00.000Z",
  "doctor": {
    "id": 1,
    "name": "Dr. Tanvir Ahmed",
    "email": "tanvir@example.com",
    "specialization": "Cardiology",
    "bmdc_reg_no": "BMDC-12345",
    "education": "MBBS, MD (Cardiology)",
    "doctor_chamber": "123 Medical Road, Dhaka",
    "visit_fee": "800.00",
    "created_at": "2026-04-01T08:00:00.000Z"
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
  },
  "medicines": [
    {
      "id": 10,
      "prescription_id": 1,
      "medicine_name": "Amlodipine",
      "dosage": "10mg",
      "timing": "0+0+1",
      "duration": "30 days",
      "notes": "Dosage increased from 5mg based on MRI findings"
    },
    {
      "id": 11,
      "prescription_id": 1,
      "medicine_name": "Aspirin",
      "dosage": "75mg",
      "timing": "1+0+0",
      "duration": "30 days",
      "notes": null
    },
    {
      "id": 12,
      "prescription_id": 1,
      "medicine_name": "Losartan",
      "dosage": "50mg",
      "timing": "1+0+0",
      "duration": "30 days",
      "notes": "New — added after reviewing lab reports"
    }
  ]
}
```

> **Note:** Medicine `id` values change after update because old medicines are deleted and new ones are created.

---

## Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Validation failed (invalid field types, invalid medicine fields) |
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | Prescription not found, or the doctor is not the owner |

**Example error:**

```json
{
  "statusCode": 404,
  "message": "Prescription not found or unauthorized",
  "error": "Not Found"
}
```

---

## Frontend Implementation Guide

### 1. Recommended Workflow: View Reports → Edit Prescription

```
Doctor views patient
  → Sees "Lab Reports" tab (GET /patients/:id/reports)
  → Reviews X-Ray, MRI, blood test results
  → Clicks "Edit Prescription" on an existing prescription
  → Updates diagnosis, medicines, advice based on findings
  → Saves (PATCH /prescriptions/:id)
  → Optionally downloads updated PDF or emails to patient
```

### 2. Edit Prescription Page/Modal

#### Loading Existing Data

First, fetch the current prescription to pre-fill the form:

```javascript
// Fetch current prescription
const response = await fetch(`/api/v1/prescriptions/${prescriptionId}`, {
  headers: { 'Authorization': `Bearer ${doctorToken}` },
});
const prescription = await response.json();

// Pre-fill form state
setChiefComplaints(prescription.chief_complaints || '');
setDiagnosis(prescription.diagnosis || '');
setInvestigation(prescription.investigation || '');
setAdvice(prescription.advice || '');
setMedicines(prescription.medicines || []);
```

#### Submitting the Update

```javascript
// Build update payload — only include changed fields
const updateData = {};

if (diagnosis !== originalDiagnosis) {
  updateData.diagnosis = diagnosis;
}
if (advice !== originalAdvice) {
  updateData.advice = advice;
}
if (investigation !== originalInvestigation) {
  updateData.investigation = investigation;
}
if (chiefComplaints !== originalChiefComplaints) {
  updateData.chief_complaints = chiefComplaints;
}

// Always send full medicines list if any medicine was added/removed/changed
if (medicinesChanged) {
  updateData.medicines = medicines.map((med) => ({
    medicine_name: med.medicine_name,
    dosage: med.dosage,
    timing: med.timing,
    duration: med.duration,
    notes: med.notes || undefined,
  }));
}

const response = await fetch(`/api/v1/prescriptions/${prescriptionId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${doctorToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updateData),
});

const updated = await response.json();
```

### 3. Medicine List Editor UI

Since updating medicines replaces the entire list, the frontend should manage medicines as an editable array:

```
┌─────────────────────────────────────────────────────────────┐
│ Rx Medicines                                    [ + Add ]   │
├─────────────────────────────────────────────────────────────┤
│ 1. Amlodipine                                               │
│    Dosage: [10mg]  Timing: [0+0+1]  Duration: [30 days]    │
│    Notes: [Dosage increased based on MRI]        [ 🗑 ]     │
├─────────────────────────────────────────────────────────────┤
│ 2. Aspirin                                                   │
│    Dosage: [75mg]  Timing: [1+0+0]  Duration: [30 days]    │
│    Notes: []                                      [ 🗑 ]     │
├─────────────────────────────────────────────────────────────┤
│ 3. Losartan  ← NEW                                          │
│    Dosage: [50mg]  Timing: [1+0+0]  Duration: [30 days]    │
│    Notes: [Added after reviewing lab reports]     [ 🗑 ]     │
└─────────────────────────────────────────────────────────────┘
```

**React state example:**

```javascript
const [medicines, setMedicines] = useState([]);

// Add new medicine row
const addMedicine = () => {
  setMedicines([...medicines, {
    medicine_name: '',
    dosage: '',
    timing: '',
    duration: '',
    notes: '',
  }]);
};

// Remove medicine row
const removeMedicine = (index) => {
  setMedicines(medicines.filter((_, i) => i !== index));
};

// Update a medicine field
const updateMedicine = (index, field, value) => {
  const updated = [...medicines];
  updated[index] = { ...updated[index], [field]: value };
  setMedicines(updated);
};
```

### 4. After Successful Update — Action Buttons

After saving, show action buttons:

```
✅ Prescription updated successfully

[ 📄 Download Updated PDF ]    [ 📧 Email to Patient ]    [ ← Back ]
```

- **Download PDF** → `GET /prescriptions/:id/pdf`
- **Email to Patient** → `POST /prescriptions/:id/send-email`

### 5. Full Page Flow Suggestion

```
/prescriptions/:id
  ├── Prescription Details (read-only view)
  │     ├── Patient info
  │     ├── Diagnosis, complaints, investigation, advice
  │     ├── Medicines list
  │     └── Action buttons: [ Edit ] [ PDF ] [ Email ]
  │
  ├── Lab Reports Tab
  │     ├── List of reports (GET /patients/:patientId/reports)
  │     ├── Click to view/download each report
  │     └── Report type badges (X-Ray, MRI, etc.)
  │
  └── Edit Mode (triggered by "Edit" button)
        ├── Editable form fields (pre-filled)
        ├── Medicine list editor (add/remove/edit rows)
        ├── [ Save ] [ Cancel ]
        └── On save → PATCH /prescriptions/:id
```

### 6. Handling the "Medicines Replace" Behavior

This is the most important thing for the frontend team to understand:

```
❌ WRONG: Sending only the new medicine
{
  "medicines": [
    { "medicine_name": "Losartan", "dosage": "50mg", ... }
  ]
}
// This DELETES Amlodipine and Aspirin, keeps only Losartan

✅ CORRECT: Sending ALL medicines (existing + new)
{
  "medicines": [
    { "medicine_name": "Amlodipine", "dosage": "10mg", ... },
    { "medicine_name": "Aspirin", "dosage": "75mg", ... },
    { "medicine_name": "Losartan", "dosage": "50mg", ... }
  ]
}
// This replaces with all 3 medicines
```

**Tip:** Always load the current medicines into state first (`GET /prescriptions/:id`), let the user add/remove/edit in the UI, then send the full array on save.

### 7. Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Fetch prescription for editing
const { data: prescription } = await api.get(`/prescriptions/${id}`);

// Update after editing
const { data: updated } = await api.patch(`/prescriptions/${id}`, {
  diagnosis: 'Updated diagnosis after MRI review',
  medicines: [
    { medicine_name: 'Amlodipine', dosage: '10mg', timing: '0+0+1', duration: '30 days' },
    { medicine_name: 'Losartan', dosage: '50mg', timing: '1+0+0', duration: '30 days' },
  ],
});

// Download updated PDF
const pdfResponse = await api.get(`/prescriptions/${id}/pdf`, {
  responseType: 'blob',
});
const pdfUrl = window.URL.createObjectURL(pdfResponse.data);
window.open(pdfUrl, '_blank');
```
