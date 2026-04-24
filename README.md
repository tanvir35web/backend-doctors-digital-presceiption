# Doctor Digital Prescription — Backend API

A digital prescription management system for doctors. Built with NestJS, TypeORM, and MySQL. Supports JWT authentication, patient management, prescription CRUD, PDF generation, and emailing prescriptions directly to patients.

## Tech Stack

- **Runtime:** Node.js 20 (Alpine)
- **Framework:** NestJS 11
- **Database:** MySQL 8.0 with TypeORM
- **Auth:** JWT (Passport)
- **PDF:** PDFKit
- **Email:** Nodemailer via @nestjs-modules/mailer
- **Containerization:** Docker & Docker Compose

## Project Structure

```
├── docker-compose.yml              # MySQL + Backend + phpMyAdmin
├── doctor-prescription-core/       # NestJS application
│   ├── src/
│   │   ├── auth/                   # Register, Login, JWT strategy & guard
│   │   ├── doctor/                 # Doctor entity & service
│   │   ├── patient/                # Patient CRUD
│   │   ├── prescription/           # Prescription CRUD, PDF generation
│   │   ├── prescription-email/     # Email service & send log entity
│   │   ├── medicine/               # Medicine entity (linked to prescriptions)
│   │   ├── dashboard/              # Stats endpoint (today/total patients & income)
│   │   ├── db/                     # TypeORM data-source & migrations
│   │   └── types/                  # Shared types
│   ├── .env                        # Environment config
│   └── Dockerfile
├── docs/                           # API documentation for frontend team
│   ├── api-patients.md
│   ├── api-prescriptions.md
│   └── api-prescription-pdf-email.md
├── API_DOCS.md                     # Full API reference
└── databaseDesignDiagram.txt       # DBML schema for dbdiagram.io
```

## Database Schema

```
doctors ──< prescriptions >── patients
                 │
                 ├──< medicines
                 └──< prescription_emails
```

- **doctors** — name, email, password, specialization, BMDC reg, education, chamber, visit fee
- **patients** — name, age, gender, phone (unique), email, weight
- **prescriptions** — doctor_id, patient_id, chief_complaints, diagnosis, investigation, advice, pdf_url
- **medicines** — prescription_id, medicine_name, dosage, timing, duration, notes
- **prescription_emails** — prescription_id, recipient_email, status, sent_at

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Run

```bash
docker compose up -d
```

This starts three services:

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000/api/v1 |
| MySQL | localhost:3307 |
| phpMyAdmin | http://localhost:8080 |

### Environment Variables

Configured in `doctor-prescription-core/.env`:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (`localhost` for local, overridden to `mysql` in Docker) |
| `DB_PORT` | Database port |
| `DB_USERNAME` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRATION` | Token expiry (e.g. `1d`) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password / app password |
| `SMTP_FROM` | Default sender name & email |

### Migrations

```bash
# Run inside the container
docker exec -it nest_backend_dev npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/db/data-source.ts
```

## API Overview

All endpoints are prefixed with `/api/v1`. Protected routes require:
```
Authorization: Bearer <access_token>
```

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new doctor, returns JWT |
| POST | `/auth/login` | Login, returns JWT |

### Patients (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create patient |
| GET | `/patients` | List all patients |
| GET | `/patients/search?phone=...` | Search by phone |
| GET | `/patients/:id` | Get patient by ID |

### Prescriptions (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prescriptions` | Create prescription with medicines |
| GET | `/prescriptions` | List doctor's prescriptions |
| GET | `/prescriptions?patientId=N` | List by patient |
| GET | `/prescriptions/:id` | Get single prescription |
| PATCH | `/prescriptions/:id` | Update prescription |
| DELETE | `/prescriptions/:id` | Delete prescription |
| GET | `/prescriptions/:id/pdf` | Download prescription as PDF |
| POST | `/prescriptions/:id/send-email` | Email PDF to patient |

### Dashboard (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Today's & total patients, income |

## PDF Prescription

The `GET /prescriptions/:id/pdf` endpoint generates a professional A4 prescription PDF with:

- Doctor header (name, education, specialization, chamber, BMDC reg)
- Date and reference number
- Patient info bar (name, gender, age, weight, phone)
- Two-column body: left sidebar (chief complaints, diagnosis, investigation) and right column (Rx medicines list, advice)
- Footer with doctor name and signature area

## Email Prescription

`POST /prescriptions/:id/send-email` sends the generated PDF as an attachment to the patient's email. Optionally pass `{ "email": "custom@example.com" }` to override the recipient. All sends are logged in the `prescription_emails` table.

## Documentation

Detailed API docs for the frontend team are in the `docs/` folder and `API_DOCS.md`.
