# Prescription Creation Workflow

## User Flow

### Step 1: Create Patient (Modal)
Doctor opens "Create Prescription" and first creates/selects a patient.

**API:** `POST /patients`

**Request:**
```json
{
  "name": "Tanjid Islam",
  "age": 35,
  "gender": "male",
  "phone": "+8801712345678",
  "email": "tanjid@example.com",
  "weight": 75.5
}
```

**Response:**
```json
{
  "id": 123,
  "name": "Tanjid Islam",
  "age": 35,
  "gender": "male",
  "phone": "+8801712345678",
  "email": "tanjid@example.com",
  "weight": 75.5,
  "created_at": "2028-01-31T10:30:00.000Z"
}
```

### Step 2: Show Patient Info on Prescription Page
After patient creation, the UI displays:
- Patient Full Name: **Tanjid Islam**
- Age: **35** | Gender: **Male** | Weight: **75 kg**
- MRDC Reg no: **AA-37948070**
- Patient Name: **Tanjid Islam**

Doctor can now fill in the prescription details.

### Step 3: Fill Prescription Details
Doctor fills in:
- **Chief Complaints:** Fever, Cough, Cold
- **Investigation:** CBC, Dengue NS1 Ag, etc.
- **Diagnosis:** Fever under evaluation, etc.
- **Medicines:** Add multiple medicines with dosage, timing, duration
- **Advice:** Regular medicine, diet instructions, etc.

### Step 4: Create Prescription
**API:** `POST /prescriptions`

**Request:**
```json
{
  "patient_id": 123,
  "chief_complaints": "Fever\nCough\nCold",
  "investigation": "CBC\nDengue NS1 Ag\nDengue Antibodies IgG & IgM\nX-Ray",
  "diagnosis": "1. Regular medicine biplob\n2. Fever under evaluation\n3. Tab Fever 100mg 1+0+1 7days (Before meal)",
  "advice": "1. Regular medicine biplob\n2. Regular nasta kori korben\n3. Regular nasta kori korben",
  "medicines": [
    {
      "medicine_name": "Tab Fever 100mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal",
      "notes": "Take with water"
    },
    {
      "medicine_name": "Tab Napa 500mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "After meal"
    },
    {
      "medicine_name": "Tab Ace 110mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal"
    }
  ]
}
```

**Response:**
```json
{
  "id": 456,
  "doctor_id": 1,
  "patient_id": 123,
  "chief_complaints": "Fever\nCough\nCold",
  "investigation": "CBC\nDengue NS1 Ag\nDengue Antibodies IgG & IgM\nX-Ray",
  "diagnosis": "1. Regular medicine biplob\n2. Fever under evaluation",
  "advice": "1. Regular medicine biplob\n2. Regular nasta kori korben",
  "pdf_url": null,
  "created_at": "2028-01-31T10:30:00.000Z",
  "doctor": {
    "id": 1,
    "name": "Doctor MBBS, BCS",
    "specialization": "Medicine Specialist",
    "bmdc_reg_no": "AA-37948070",
    "education": "MBBS",
    "doctor_chamber": "Dhaka Medical",
    "visit_fee": "500.00"
  },
  "patient": {
    "id": 123,
    "name": "Tanjid Islam",
    "age": 35,
    "gender": "male",
    "phone": "+8801712345678",
    "email": "tanjid@example.com",
    "weight": 75.5
  },
  "medicines": [
    {
      "id": 1,
      "prescription_id": 456,
      "medicine_name": "Tab Fever 100mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal",
      "notes": "Take with water"
    },
    {
      "id": 2,
      "prescription_id": 456,
      "medicine_name": "Tab Napa 500mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "After meal",
      "notes": null
    },
    {
      "id": 3,
      "prescription_id": 456,
      "medicine_name": "Tab Ace 110mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal",
      "notes": null
    }
  ]
}
```

### Step 5: Generate PDF (Optional)
After prescription is created, doctor can click "Print" to generate PDF.

**API:** `GET /prescriptions/456/pdf` (To be implemented)

---

## Alternative Flow: Existing Patient

If the patient already exists in the system:

### Option A: Search Patient
**API:** `GET /patients?phone=+8801712345678`

Returns existing patient, use their `id` for prescription.

### Option B: List Recent Patients
**API:** `GET /patients`

Show list of recent patients, doctor selects one, use their `id` for prescription.

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/patients` | Create new patient |
| GET | `/patients` | List all patients |
| GET | `/patients?phone=xxx` | Search patient by phone |
| GET | `/patients/:id` | Get single patient |
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions` | List all prescriptions |
| GET | `/prescriptions/:id` | Get single prescription |
| GET | `/prescriptions/:id/pdf` | Generate PDF (to be implemented) |

---

## Example: Complete POST Body for Prescription

```json
{
  "patient_id": 123,
  "chief_complaints": "Fever\nCough\nCold",
  "investigation": "CBC\nDengue NS1 Ag\nDengue Antibodies IgG & IgM\nX-Ray",
  "diagnosis": "1. Regular medicine biplob\n2. Fever under evaluation\n3. Tab Fever 100mg 1+0+1 7days (Before meal)",
  "advice": "1. Regular medicine biplob\n2. Regular nasta kori korben\n3. Regular nasta kori korben",
  "medicines": [
    {
      "medicine_name": "Tab Fever 100mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal",
      "notes": "Take with water"
    },
    {
      "medicine_name": "Tab Napa 500mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "After meal"
    }
  ]
}
```

**Minimal Example:**
```json
{
  "patient_id": 123
}
```

All fields except `patient_id` are optional!
