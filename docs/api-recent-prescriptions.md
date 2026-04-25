# Recent Prescriptions API — Frontend Integration Guide

**Base URL:** `http://localhost:3000/api/v1`

---

## Overview

A new endpoint is available to fetch the **last 10 prescriptions** for the logged-in doctor. This is intended for the dashboard / recent prescriptions section, so you no longer need to fetch all prescriptions and slice on the client side.

---

## Endpoint

```
GET /api/v1/prescriptions/recent
```

- **Auth:** Requires JWT Bearer token (same as all other endpoints)
- **Returns:** Array of up to 10 prescription objects, sorted by `created_at` DESC (newest first)

---

## Request Example

```ts
const response = await fetch('/api/v1/prescriptions/recent', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const recentPrescriptions = await response.json();
```

### Using Axios

```ts
const { data } = await axios.get('/api/v1/prescriptions/recent', {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## Response `200 OK`

The response is **exactly the same** as `GET /prescriptions` — same structure, same fields, same nested relations. The only difference is it returns a maximum of 10 items.

```json
[
  {
    "id": 1,
    "doctor_id": 1,
    "patient_id": 1,
    "chief_complaints": "Fever (3 days)\nHeadache\nDry cough",
    "diagnosis": "Viral Fever\nUpper Respiratory Tract Infection (URTI)",
    "investigation": "CBC\nBlood Sugar (Random)\nChest X-ray (if cough persists >5 days)",
    "advice": "Take adequate rest\nDrink plenty of fluids\nAvoid cold food & drinks\nSteam inhalation 2 times daily\nIf symptoms worsen, revisit after 3 days",
    "pdf_url": null,
    "created_at": "2026-04-25T05:08:42.472Z",
    "doctor": {
      "id": 1,
      "name": "Dr. Tanvirul Islam",
      "email": "doctor.tanvir@gmail.com",
      "specialization": "Cardiology (Heart & Vascular Specialist)",
      "bmdc_reg_no": "BMDC-9032781932132",
      "education": "MBBS, MD (Cardiology)",
      "doctor_chamber": "123 Medical Road, Dhaka-1204",
      "visit_fee": "1000.00",
      "created_at": "2026-04-25T04:51:26.028Z"
    },
    "patient": {
      "id": 1,
      "name": "Rezaul Islam",
      "age": 31,
      "gender": "male",
      "phone": "+8801621276301",
      "email": "mrezaulislam.t@gmail.com",
      "weight": "86.00",
      "created_at": "2026-04-25T05:03:41.275Z"
    },
    "medicines": [
      {
        "id": 4,
        "prescription_id": 1,
        "medicine_name": "Vitamin C (e.g., Ceevit 500 mg)",
        "dosage": "1+0+0",
        "timing": "After breakfast",
        "duration": "7 days",
        "notes": "Helps boost immunity"
      },
      {
        "id": 3,
        "prescription_id": 1,
        "medicine_name": "Tusca Syrup (Cough syrup)",
        "dosage": "2 চামচ × 3 times daily",
        "timing": "After meal",
        "duration": "5 days",
        "notes": "Shake well before use"
      },
      {
        "id": 2,
        "prescription_id": 1,
        "medicine_name": "Histacin (Antihistamine)",
        "dosage": "0+0+1",
        "timing": "রাতে (Night)",
        "duration": "5 days",
        "notes": "May cause drowsiness"
      },
      {
        "id": 1,
        "prescription_id": 1,
        "medicine_name": "Napa (Paracetamol 500 mg)",
        "dosage": "1+0+1",
        "timing": "After meal",
        "duration": "5 days",
        "notes": "Take if fever >100°F"
      }
    ]
  }
]
```

> **Same response as `GET /prescriptions`** — you can use the same TypeScript types, same parsing logic, same UI components. Just swap the endpoint URL.

---

## When to Use Which Endpoint

| Page / Component | Endpoint | Notes |
|------------------|----------|-------|
| Dashboard / Recent Prescriptions widget | `GET /prescriptions/recent` | Returns last 10 only |
| All Prescriptions page | `GET /prescriptions` | Returns full list |
| Patient-specific prescriptions | `GET /prescriptions?patientId={id}` | Filtered by patient |

---

## Migration Notes

If you're currently using `GET /prescriptions` and slicing the first 10 on the frontend for the recent section, you can replace that with:

```diff
- const { data } = await axios.get('/api/v1/prescriptions');
- const recent = data.slice(0, 10);
+ const { data: recent } = await axios.get('/api/v1/prescriptions/recent');
```

This reduces payload size and is faster since the backend only queries 10 rows instead of all prescriptions.

---

## TypeScript Interface (for reference)

```ts
interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization: string;
  bmdc_reg_no: string;
  education: string;
  doctor_chamber: string;
  visit_fee: string;
  created_at: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string | null;
  weight: string | null;
  created_at: string;
}

interface Medicine {
  id: number;
  prescription_id: number;
  medicine_name: string;
  dosage: string;
  timing: string;
  duration: string;
  notes: string | null;
}

interface Prescription {
  id: number;
  doctor_id: number;
  patient_id: number;
  chief_complaints: string | null;
  diagnosis: string | null;
  investigation: string | null;
  advice: string | null;
  pdf_url: string | null;
  created_at: string;
  doctor: Doctor;
  patient: Patient;
  medicines: Medicine[];
}
```
