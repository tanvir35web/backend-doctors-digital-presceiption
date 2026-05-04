# Doctor Digital Prescription System

A comprehensive digital prescription management system built with NestJS. Supports doctor and lab authentication, prescription creation with PDF generation, email delivery, medical report uploads, and dashboard analytics.

## Tech Stack

- **Framework:** NestJS 11 (TypeScript)
- **Database:** MySQL 8.0 with TypeORM
- **Authentication:** JWT with role-based access (Doctor / Lab)
- **PDF Generation:** PDFKit with Bangla font support
- **Email:** Nodemailer (SMTP)
- **File Storage:** Cloudinary (images) + Supabase Storage (PDFs)
- **Containerization:** Docker + Docker Compose

## Features

- Doctor registration, login, and profile management
- Patient CRUD with phone-based deduplication
- Prescription creation with medicines, diagnosis, investigation, advice
- PDF generation (A4 layout, Bangla support, two-column design)
- Email prescription PDF as attachment
- Lab registration and authentication
- Medical report upload (X-Ray, MRI, CT Scan, Blood Test, Ultrasound)
- Image uploads to Cloudinary, PDF uploads to Supabase Storage
- Doctor dashboard with daily/total patient count and earnings
- Role-based access control (Doctor vs Lab)

## Project Structure

```
src/
├── auth/                  # Doctor JWT auth (register, login, guards)
├── lab-auth/              # Lab JWT auth (register, login)
├── doctor/                # Doctor entity & service
├── patient/               # Patient CRUD
├── prescription/          # Prescription CRUD, PDF generation
├── prescription-email/    # Email delivery with PDF attachment
├── medicine/              # Medicine entity
├── medical-report/        # Lab report upload (Cloudinary + Supabase)
├── lab/                   # Lab entity & service
├── dashboard/             # Doctor dashboard stats
├── db/                    # TypeORM data-source & migrations
├── assets/fonts/          # Bangla fonts (NotoSansBengali)
└── main.ts                # App bootstrap (CORS, validation, prefix)
```

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8.0 (or use Docker)
- Cloudinary account (for image uploads)
- Supabase project (for PDF uploads)
- Gmail App Password (for email)

### 1. Clone and Install

```bash
cd doctor-prescription-core
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=prescription_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Doctor Digital Prescription <your_email@gmail.com>"

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase Storage (PDF uploads)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional
PORT=3000
CORS_ORIGIN=http://localhost:3001
DB_SSL=false
```

### 3. Run with Docker (Recommended)

```bash
# From project root (parent directory)
docker compose up -d
```

This starts:
- **Backend** on `http://localhost:3000`
- **MySQL** on port `3307`
- **phpMyAdmin** on `http://localhost:8080`

### 4. Run without Docker

```bash
# Make sure MySQL is running locally
npm run start:dev
```

### 5. Run Migrations

```bash
npm run migration:run
```

## API Base URL

```
http://localhost:3000/api/v1
```

All endpoints are prefixed with `/api/v1`. Authentication required endpoints need:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register doctor | No |
| POST | `/auth/login` | Login doctor | No |
| POST | `/lab/auth/register` | Register lab | No |
| POST | `/lab/auth/login` | Login lab | No |

### Doctor

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/doctor` | List all doctors | No |

### Patients

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/patients` | Create patient | Doctor |
| GET | `/patients` | List patients | Doctor |
| GET | `/patients?phone=X` | Search by phone | Doctor |
| GET | `/patients/:id` | Get patient | Doctor |
| GET | `/patients/:id/reports` | Get patient reports | Doctor |

### Prescriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/prescriptions` | Create prescription | Doctor |
| GET | `/prescriptions` | List prescriptions | Doctor |
| GET | `/prescriptions?patientId=X` | Filter by patient | Doctor |
| GET | `/prescriptions/recent` | Recent prescriptions | Doctor |
| GET | `/prescriptions/:id` | Get prescription | Doctor |
| PATCH | `/prescriptions/:id` | Update prescription | Doctor |
| DELETE | `/prescriptions/:id` | Delete prescription | Doctor |
| GET | `/prescriptions/:id/pdf` | Download PDF | Doctor |
| POST | `/prescriptions/:id/send-email` | Email prescription | Doctor |

### Medical Reports (Lab)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/lab/reports/upload` | Upload report (multipart) | Lab |
| GET | `/lab/reports` | List lab reports | Lab |
| GET | `/lab/reports/:id` | Get report | Lab |
| DELETE | `/lab/reports/:id` | Delete report | Lab |
| GET | `/lab/patients/search?phone=X` | Search patient | Lab |
| GET | `/lab/patients/:id` | Get patient | Lab |

### Reports (Shared)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports/:id/download` | Download report file | Doctor/Lab |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/stats` | Doctor statistics | Doctor |

## File Upload (Medical Reports)

Labs can upload medical reports for patients. The system uses a dual-cloud storage strategy.

### Supported File Types

| Type | MIME | Storage |
|------|------|---------|
| JPEG | `image/jpeg` | Cloudinary |
| PNG | `image/png` | Cloudinary |
| WebP | `image/webp` | Cloudinary |
| PDF | `application/pdf` | Supabase Storage |

**Max file size:** 10 MB

### Upload Flow

```
Client (multipart/form-data)
  → Multer (saves to ./uploads/reports/ temporarily)
    → Image? → Cloudinary upload → get secure_url → save to DB → delete temp file
    → PDF?   → Supabase Storage upload → get public URL → save to DB → delete temp file
```

1. File is received via `multipart/form-data` using Multer with `diskStorage`
2. Multer saves the file temporarily to `./uploads/reports/` with a UUID filename
3. Based on MIME type:
   - **Images** → uploaded to Cloudinary (`medical-reports` folder, `image` resource type), returns `secure_url`
   - **PDFs** → uploaded to Supabase Storage (`medical-reports` bucket, public), returns `publicUrl`
4. The cloud URL is saved in the `file_url` column of `medical_reports` table
5. The local temp file is deleted after successful upload (also cleaned up on failure)

### Upload API

```
POST /api/v1/lab/reports/upload
Authorization: Bearer <lab_token>
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | JPEG, PNG, WebP, or PDF (max 10MB) |
| `patient_id` | number | Yes | Patient ID |
| `report_type` | string | Yes | `xray`, `mri`, `ct_scan`, `blood_test`, `ultrasound`, `other` |
| `title` | string | Yes | Report title |
| `description` | string | No | Optional notes |
| `report_date` | string | Yes | ISO date (e.g. `2026-04-25`) |

**Example Response:**

```json
{
  "message": "Report uploaded successfully",
  "data": {
    "id": 1,
    "lab_id": 1,
    "patient_id": 1,
    "report_type": "xray",
    "title": "Chest X-Ray",
    "file_url": "https://res.cloudinary.com/xxx/image/upload/v123/medical-reports/abc.jpg",
    "file_type": "image",
    "original_filename": "chest-xray.jpg",
    "report_date": "2026-04-25"
  }
}
```

### Download / View Report

```
GET /api/v1/reports/:id/download
Authorization: Bearer <doctor_or_lab_token>
```

- If `file_url` starts with `http` (cloud-hosted) → redirects to the cloud URL
- If `file_url` is a local path (legacy) → serves the file from disk

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Supabase Storage Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to Storage → create a bucket named `medical-reports` with **Public** access enabled
3. Go to Settings → API → copy Project URL and `service_role` key
4. Add to `.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

> **Why two services?** Cloudinary free tier doesn't support PDF delivery (`raw` resource type returns 401). Images go to Cloudinary, PDFs go to Supabase Storage — both serve public URLs.

---

## Prescription PDF Generation

Prescriptions can be downloaded as professionally formatted PDF files.

### How It Works

- Uses **PDFKit** library to generate A4-sized PDFs
- Supports **Bangla (বাংলা)** text using NotoSansBengali fonts
- Auto-detects Bangla characters and switches fonts accordingly
- Two-column layout: left sidebar (complaints, diagnosis, investigation) + right column (Rx medicines, advice)

### PDF Layout

```
┌─────────────────────────────────────────────┐
│  Dr. Name                     Date: ...     │
│  Education, Specialization    Ref: 00000001 │
│  Chamber, BMDC Reg No, Email                │
├─────────────────────────────────────────────┤
│  Patient Name: ...   Gender | Age | Weight  │
│  Phone: ...                                 │
├──────────────┬──────────────────────────────┤
│ Chief        │  Rx                          │
│ Complaints:  │  1. Medicine Name            │
│  • Fever     │     1+0+1  7days  Before meal│
│  • Cough     │  2. Medicine Name            │
│              │     1+1+1  5days  After meal │
│ Diagnosis:   │                              │
│  • ...       ├──────────────────────────────┤
│              │  Advice:                     │
│ Investigation│  • Regular medicine          │
│  • CBC       │  • Diet instructions         │
│  • X-Ray     │                              │
├──────────────┴──────────────────────────────┤
│  ISSUED BY                     SIGNATURE    │
│  Dr. Name                      ------------ │
│  Specialization                             │
└─────────────────────────────────────────────┘
```

### PDF API

```
GET /api/v1/prescriptions/:id/pdf
Authorization: Bearer <doctor_token>
```

Returns binary PDF with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription-{id}.pdf"
```

---

## Prescription Email

Prescriptions can be emailed to patients with the PDF attached.

### How It Works

1. Generates the prescription PDF using PDFKit
2. Sends email via SMTP (Gmail) with the PDF as attachment
3. Logs the email in `prescription_emails` table

### Email Content

- **To:** Patient's email (or custom `recipientEmail` from request body)
- **Subject:** `Prescription from Dr. {doctor_name}`
- **Body:** Plain text greeting with doctor's name and specialization
- **Attachment:** `prescription-{id}.pdf`

### Email API

```
POST /api/v1/prescriptions/:id/send-email
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

```json
{
  "email": "custom@example.com"
}
```

> `email` field is optional. If omitted, uses the patient's email from the database.

**Response:**

```json
{
  "message": "Prescription sent successfully",
  "recipient": "patient@example.com",
  "sent_at": "2026-04-24T10:30:00.000Z"
}
```

### Gmail SMTP Setup

1. Enable 2-Step Verification on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Add to `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password
   SMTP_FROM="Doctor Digital Prescription <your_email@gmail.com>"
   ```

---

## Authentication & Authorization

### JWT Token Flow

```
Register/Login → JWT token (contains: sub, email, role)
  → Send token in Authorization header
    → JwtAuthGuard validates token
      → RolesGuard checks role (doctor/lab)
```

### Roles

| Role | Token Payload | Access |
|------|--------------|--------|
| `doctor` | `{ sub: id, email, role: "doctor" }` | Patients, Prescriptions, Dashboard |
| `lab` | `{ sub: id, email, role: "lab" }` | Report Upload, Patient Search |

### Password Security

- Passwords are hashed with **bcrypt** (10 salt rounds)
- Plain text passwords are never stored

---

## Dashboard

```
GET /api/v1/dashboard/stats
Authorization: Bearer <doctor_token>
```

**Response:**

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

| Field | Description |
|-------|-------------|
| `today_patients` | Unique patients from today's prescriptions |
| `today_income` | Sum of visit fees from today's prescriptions |
| `total_patients` | Total unique patients (all time) |
| `total_earning` | Sum of visit fees across all prescriptions |

---

## Docker Setup

```yaml
# docker-compose.yml starts 3 services:
backend     → NestJS app (port 3000)
mysql       → MySQL 8.0 (port 3307 → 3306)
phpmyadmin  → Database UI (port 8080)
```

```bash
docker compose up -d       # Start all services
docker compose down        # Stop all services
docker compose logs -f     # View logs
```

MySQL has a health check — backend waits for MySQL to be ready before starting.

---

## Database Schema

```
doctors          → id, name, email, password_hash, specialization, bmdc_reg_no, education, doctor_chamber, visit_fee
patients         → id, name, age, gender, phone (unique), email, weight
prescriptions    → id, doctor_id, patient_id, chief_complaints, diagnosis, investigation, advice, pdf_url
medicines        → id, prescription_id, medicine_name, dosage, timing, duration, notes
labs             → id, name, email, password_hash, phone, address, license_no
medical_reports  → id, lab_id, patient_id, report_type, title, description, file_url, file_type, original_filename, report_date
prescription_emails → id, prescription_id, recipient_email, sent_at, status
```

## Scripts

```bash
npm run start:dev        # Development (watch mode)
npm run start:prod       # Production
npm run build            # Compile TypeScript
npm run lint             # ESLint with auto-fix
npm run test             # Unit tests
npm run test:cov         # Test coverage
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration
```

## License

UNLICENSED
