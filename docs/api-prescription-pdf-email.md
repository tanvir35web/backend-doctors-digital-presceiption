# Prescription PDF & Email API

**Base URL:** `http://localhost:3000/api/v1`

> These endpoints require authentication. Send the JWT token from login/register as:
> ```
> Authorization: Bearer <access_token>
> ```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/prescriptions/:id/pdf` | Download prescription as PDF |
| POST | `/prescriptions/:id/send-email` | Email prescription PDF to patient |

---

## GET `/prescriptions/:id/pdf`

Downloads the prescription as a professionally formatted PDF file. The PDF includes:

- Doctor header (name, specialization, education, BMDC reg no, chamber)
- Patient info (name, age, gender, weight, phone)
- Prescription date
- Clinical details (chief complaints, investigation, diagnosis)
- Medicine table (Rx) with name, dosage, timing, duration, notes
- Advice section
- Doctor signature area

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | Prescription ID |

### Response `200 OK`

Returns a binary PDF file.

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription-{id}.pdf"
```

### Frontend Integration

```javascript
// Option 1: Direct download via link/window
window.open(`http://localhost:3000/api/v1/prescriptions/${id}/pdf`, '_blank');

// Option 2: Fetch with auth token and trigger download
const response = await fetch(`http://localhost:3000/api/v1/prescriptions/${id}/pdf`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `prescription-${id}.pdf`;
a.click();
window.URL.revokeObjectURL(url);

// Option 3: Preview in new tab
const response = await fetch(`http://localhost:3000/api/v1/prescriptions/${id}/pdf`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
window.open(url, '_blank');
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | Prescription not found |

---

## POST `/prescriptions/:id/send-email`

Sends the prescription PDF as an email attachment to the patient. By default it uses the patient's email from the database. You can override it by passing a custom email in the request body.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | Prescription ID |

### Request Body (optional)

```json
{
  "email": "custom-recipient@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | No | Override recipient email. If not provided, uses the patient's email from the database. |

### Response `200 OK`

```json
{
  "message": "Prescription sent successfully",
  "recipient": "patient@example.com",
  "sent_at": "2026-04-24T10:30:00.000Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | Prescription not found or unauthorized (doctor doesn't own this prescription) |
| `404 Not Found` | No email address found — patient has no email and no override was provided |

### Email Details

The patient receives an email with:
- **From:** `Doctor Digital Prescription <islammdtanvirul@gmail.com>`
- **Subject:** `Prescription from Dr. {doctor_name}`
- **Body:** A short text message addressing the patient by name
- **Attachment:** `prescription-{id}.pdf`

---

## UI Suggestions

### After Creating a Prescription

After a successful `POST /prescriptions`, show two action buttons:

```
[ 📄 Download PDF ]    [ 📧 Send to Patient ]
```

- **Download PDF** → calls `GET /prescriptions/:id/pdf`
- **Send to Patient** → calls `POST /prescriptions/:id/send-email`

### On Prescription Detail/List Page

Add icons or buttons on each prescription row:

```
Prescription #12 — Rahim Uddin — 24 Apr 2026    [ PDF ] [ Email ]
```

### Email Button Behavior

1. If the patient has an email on file → send directly, show success toast
2. If the patient has no email → show a small modal/input asking for the recipient email, then send with `{ "email": "..." }` in the body
3. Show a loading spinner while sending (email can take 2-3 seconds)
4. On success → show toast: `"Prescription sent to patient@example.com"`
5. On error → show toast with the error message

---

## Notes

- Only the doctor who created the prescription can send it via email.
- Any doctor can download the PDF for any prescription they can view.
- The email send is logged in the `prescription_emails` table (for audit/history).
- PDF is generated on-the-fly — it is not stored on disk.
