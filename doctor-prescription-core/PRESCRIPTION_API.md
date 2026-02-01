# Prescription API Documentation

## Overview
This API allows doctors to create, view, update, and delete prescriptions with complete patient information, medicines, chief complaints, investigations, diagnosis, and advice.

## Endpoints

### 1. Create Prescription
**POST** `/prescriptions`

Creates a new prescription with all details including medicines.

**Request Body:**
```json
{
  "patient": {
    "name": "Tanjid Islam",
    "age": 35,
    "gender": "male",
    "phone": "+8801234567890",
    "email": "patient@example.com",
    "weight": 75.5
  },
  "chief_complaints": "Fever, Cough, Cold",
  "investigation": "CBC, Dengue NS1 Ag, Dengue Antibodies IgG & IgM, X-Ray",
  "diagnosis": "1. Regular medicine biplob\n2. Fever under evaluation\n3. Tab Fever 100mg 1+0+1 7days (Before meal)",
  "advice": "1. Regular medicine biplob\n2. Regular nasta kori korben",
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

**Note:** The patient is automatically created or updated based on the phone number. If a patient with the same phone exists, their information will be updated with the new details.

**Response:**
```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Fever, Cough, Cold",
  "investigation": "CBC, Dengue NS1 Ag, Dengue Antibodies IgG & IgM, X-Ray",
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
    "id": 1,
    "name": "Tanjid Islam",
    "age": 35,
    "gender": "male",
    "phone": "+8801234567890",
    "email": "patient@example.com",
    "weight": 75.50
  },
  "medicines": [
    {
      "id": 1,
      "prescription_id": 1,
      "medicine_name": "Tab Fever 100mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "Before meal",
      "notes": "Take with water"
    },
    {
      "id": 2,
      "prescription_id": 1,
      "medicine_name": "Tab Napa 500mg",
      "dosage": "1+0+1",
      "timing": "7days",
      "duration": "After meal",
      "notes": null
    }
  ]
}
```

### 2. Get All Prescriptions
**GET** `/prescriptions`

Retrieves all prescriptions for the logged-in doctor.

**Query Parameters:**
- `patientId` (optional): Filter prescriptions by patient ID

**Response:**
```json
[
  {
    "id": 1,
    "doctor_id": 1,
    "patient_id": 1,
    "chief_complaints": "Fever, Cough, Cold",
    "investigation": "CBC, Dengue NS1 Ag",
    "diagnosis": "Fever under evaluation",
    "advice": "Regular medicine",
    "pdf_url": null,
    "created_at": "2028-01-31T10:30:00.000Z",
    "doctor": { ... },
    "patient": { ... },
    "medicines": [ ... ]
  }
]
```

### 3. Get Single Prescription
**GET** `/prescriptions/:id`

Retrieves a specific prescription by ID with all related data.

**Response:**
```json
{
  "id": 1,
  "doctor_id": 1,
  "patient_id": 1,
  "chief_complaints": "Fever, Cough, Cold",
  "investigation": "CBC, Dengue NS1 Ag",
  "diagnosis": "Fever under evaluation",
  "advice": "Regular medicine",
  "pdf_url": null,
  "created_at": "2028-01-31T10:30:00.000Z",
  "doctor": { ... },
  "patient": { ... },
  "medicines": [ ... ]
}
```

### 4. Update Prescription
**PATCH** `/prescriptions/:id`

Updates an existing prescription. Only the doctor who created it can update.

**Request Body:** (All fields optional)
```json
{
  "chief_complaints": "Updated complaints",
  "investigation": "Updated investigation",
  "diagnosis": "Updated diagnosis",
  "advice": "Updated advice",
  "medicines": [
    {
      "medicine_name": "New Medicine",
      "dosage": "1+1+1",
      "timing": "5days",
      "duration": "After meal"
    }
  ]
}
```

**Note:** When updating medicines, all existing medicines will be replaced with the new list.

### 5. Delete Prescription
**DELETE** `/prescriptions/:id`

Deletes a prescription. Only the doctor who created it can delete.

**Response:**
```json
{
  "message": "Prescription deleted successfully"
}
```

## Data Models

### Prescription Fields
- `patient` (required): Patient information object
  - `name` (required): Patient's full name
  - `age` (required): Patient's age
  - `gender` (required): male/female/other
  - `phone` (required): Contact number (used as unique identifier)
  - `email` (optional): Email address
  - `weight` (optional): Patient's weight in kg
- `chief_complaints` (optional): Patient's main complaints
- `investigation` (optional): Medical investigations/tests ordered
- `diagnosis` (optional): Doctor's diagnosis
- `advice` (optional): Medical advice for the patient
- `medicines` (optional): Array of medicine objects

### Medicine Fields
- `medicine_name` (required): Name of the medicine
- `dosage` (required): Dosage information (e.g., "1+0+1")
- `timing` (required): Duration/timing (e.g., "7days")
- `duration` (required): When to take (e.g., "Before meal", "After meal")
- `notes` (optional): Additional notes about the medicine

### Patient Fields (for reference)
- `name`: Patient's full name
- `age`: Patient's age
- `gender`: male/female/other
- `phone`: Contact number (unique identifier - used to find/create patient)
- `email`: Email address (optional)
- `weight`: Patient's weight in kg (optional)

**Patient Logic:**
- When creating a prescription, the system checks if a patient with the given phone number exists
- If exists: Updates the patient's information with the new data
- If not exists: Creates a new patient record
- This ensures no duplicate patients and keeps information up-to-date

## Next Steps: PDF Generation

To implement PDF generation for prescriptions, you'll need to:

1. Install PDF generation library:
   ```bash
   npm install puppeteer @nestjs/puppeteer
   ```

2. Create a PDF service that:
   - Generates HTML template with prescription data
   - Converts HTML to PDF using Puppeteer
   - Saves PDF to storage (local/cloud)
   - Updates prescription with `pdf_url`

3. Add PDF endpoint:
   ```
   GET /prescriptions/:id/pdf - Generate and download PDF
   ```

Would you like me to implement the PDF generation feature next?
