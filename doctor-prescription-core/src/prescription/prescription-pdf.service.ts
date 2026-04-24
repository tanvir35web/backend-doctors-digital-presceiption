import { Injectable } from '@nestjs/common';
import * as PDFDocumentLib from 'pdfkit';
const PDFDocument = PDFDocumentLib.default || PDFDocumentLib;
import { Prescription } from './prescription.entity';

@Injectable()
export class PrescriptionPdfService {
  // Layout constants
  private readonly PAGE_W = 595.28; // A4 width
  private readonly PAGE_H = 841.89; // A4 height
  private readonly M = 40; // outer margin
  private readonly INNER_L = 40; // content left
  private readonly INNER_R = 555; // content right
  private readonly CONTENT_W = 515; // INNER_R - INNER_L
  private readonly SIDEBAR_W = 160;
  private readonly DIVIDER_X = 210; // vertical divider x
  private readonly MAIN_L = 225; // right column left
  private readonly MAIN_W = 330; // right column width

  // Colors
  private readonly CLR_DARK = '#1e293b';
  private readonly CLR_MED = '#475569';
  private readonly CLR_LIGHT = '#94a3b8';
  private readonly CLR_LINE = '#cbd5e1';
  private readonly CLR_BG = '#f8fafc';
  private readonly CLR_NOTE = '#94a3b8';

  async generatePdf(prescription: Prescription): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const doctor = prescription.doctor;
      const patient = prescription.patient;
      const refId = String(prescription.id).padStart(8, '0');
      const dateStr = new Date(prescription.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // ===== HEADER SECTION =====
      let y = this.drawHeader(doc, doctor, dateStr, refId);

      // ===== HEADER DIVIDER =====
      y += 8;
      this.drawHLine(doc, this.INNER_L, this.INNER_R, y);
      y += 12;

      // ===== PATIENT INFO BAR =====
      y = this.drawPatientBar(doc, patient, y);

      // ===== DIVIDER BELOW PATIENT =====
      y += 8;
      this.drawHLine(doc, this.INNER_L, this.INNER_R, y);
      y += 15;

      // ===== TWO-COLUMN BODY =====
      const bodyTop = y;
      let leftY = bodyTop;
      let rightY = bodyTop;

      // --- LEFT SIDEBAR ---
      if (prescription.chief_complaints) {
        leftY = this.drawSidebarSection(doc, 'Chief Complaints:', prescription.chief_complaints, leftY);
      }
      if (prescription.diagnosis) {
        leftY = this.drawSidebarSection(doc, 'Diagnosis:', prescription.diagnosis, leftY);
      }
      if (prescription.investigation) {
        leftY = this.drawSidebarSection(doc, 'Investigation:', prescription.investigation, leftY);
      }

      // --- VERTICAL DIVIDER ---
      // Will be drawn after we know the body height

      // --- RIGHT COLUMN: Rx ---
      if (prescription.medicines && prescription.medicines.length > 0) {
        rightY = this.drawRxSection(doc, prescription.medicines, rightY);
      }

      // --- RIGHT COLUMN: Advice ---
      if (prescription.advice) {
        rightY += 5;
        this.drawHLine(doc, this.MAIN_L, this.INNER_R, rightY);
        rightY += 12;
        rightY = this.drawAdviceSection(doc, prescription.advice, rightY);
      }

      // Draw vertical divider for the body
      const bodyBottom = Math.max(leftY, rightY) + 10;
      doc
        .moveTo(this.DIVIDER_X, bodyTop - 5)
        .lineTo(this.DIVIDER_X, bodyBottom)
        .strokeColor(this.CLR_LINE)
        .lineWidth(0.5)
        .stroke();

      // ===== FOOTER DIVIDER =====
      const footerY = Math.max(bodyBottom + 20, this.PAGE_H - 120);
      this.drawHLine(doc, this.INNER_L, this.INNER_R, footerY);

      // ===== FOOTER =====
      this.drawFooter(doc, doctor, footerY + 12);

      doc.end();
    });
  }

  // ─── Drawing helpers ───

  private drawHLine(doc: any, x1: number, x2: number, y: number) {
    doc
      .moveTo(x1, y)
      .lineTo(x2, y)
      .strokeColor(this.CLR_LINE)
      .lineWidth(0.5)
      .stroke();
  }

  private drawHeader(doc: any, doctor: any, dateStr: string, refId: string): number {
    let y = this.M + 10;

    // Doctor name
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor(this.CLR_DARK)
      .text(doctor.name, this.INNER_L, y);
    y += 24;

    // Doctor details (left side)
    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    doc.text(doctor.education, this.INNER_L, y);
    y += 14;
    doc.text(doctor.specialization, this.INNER_L, y);
    y += 14;
    doc.text(doctor.doctor_chamber, this.INNER_L, y);
    y += 14;
    doc.text(`BMDC Reg. No - ${doctor.bmdc_reg_no}`, this.INNER_L, y);
    y += 14;
    doc.text(doctor.email, this.INNER_L, y);

    // Date & Ref (right-aligned, compact)
    const headerTopY = this.M + 10;

    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    const dateLabel = 'Date: ';
    const dateLabelW = doc.widthOfString(dateLabel);
    doc.font('Helvetica-Bold').fillColor(this.CLR_DARK);
    const dateValW = doc.widthOfString(dateStr);
    const dateLineW = dateLabelW + dateValW;
    const dateX = this.INNER_R - dateLineW;

    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    doc.text(dateLabel, dateX, headerTopY, { continued: true });
    doc.font('Helvetica-Bold').fillColor(this.CLR_DARK).text(dateStr);

    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    const refLabel = 'Ref: ';
    const refLabelW = doc.widthOfString(refLabel);
    doc.font('Helvetica-Bold').fillColor(this.CLR_DARK);
    const refValW = doc.widthOfString(refId);
    const refLineW = refLabelW + refValW;
    const refX = this.INNER_R - refLineW;

    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    doc.text(refLabel, refX, headerTopY + 16, { continued: true });
    doc.font('Helvetica-Bold').fillColor(this.CLR_DARK).text(refId);

    y += 14;
    return y;
  }

  private drawPatientBar(doc: any, patient: any, y: number): number {
    // Background bar
    doc
      .rect(this.INNER_L, y - 4, this.CONTENT_W, 34)
      .fill(this.CLR_BG);

    const barY = y + 3;
    const x = this.INNER_L + 10;

    // Row 1: Patient Name (left) | Gender | Age | Weight (right)
    doc.font('Helvetica-Bold').fontSize(10).fillColor(this.CLR_DARK);
    doc.text('Patient Name: ', x, barY, { continued: true });
    doc.font('Helvetica').fillColor(this.CLR_MED).text(patient.name, { continued: false });

    // Gender, Age, Weight inline on the right half
    const rightStart = 300;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(this.CLR_DARK);
    doc.text('Gender: ', rightStart, barY, { continued: true });
    doc.font('Helvetica').fillColor(this.CLR_MED).text(patient.gender, { continued: false });

    doc.font('Helvetica-Bold').fillColor(this.CLR_DARK);
    doc.text('Age: ', rightStart + 100, barY, { continued: true });
    doc.font('Helvetica').fillColor(this.CLR_MED).text(String(patient.age), { continued: false });

    if (patient.weight) {
      doc.font('Helvetica-Bold').fillColor(this.CLR_DARK);
      doc.text('Weight: ', rightStart + 170, barY, { continued: true });
      doc.font('Helvetica').fillColor(this.CLR_MED).text(String(patient.weight), { continued: false });
    }

    // Row 2: Phone
    const row2Y = barY + 15;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(this.CLR_DARK);
    doc.text('Phone: ', x, row2Y, { continued: true });
    doc.font('Helvetica').fillColor(this.CLR_MED).text(patient.phone, { continued: false });

    return row2Y + 18;
  }

  private drawSidebarSection(doc: any, title: string, content: string, y: number): number {
    const x = this.INNER_L + 5;
    const w = this.SIDEBAR_W - 10;

    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.CLR_DARK).text(title, x, y, { width: w });
    y = doc.y + 4;

    // Render as bullet list
    const items = content.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    for (const item of items) {
      doc.text(`•  ${item}`, x + 5, y, { width: w - 10 });
      y = doc.y + 2;
    }

    y += 12;
    return y;
  }

  private drawRxSection(doc: any, medicines: any[], y: number): number {
    const x = this.MAIN_L;

    // Rx symbol
    doc.font('Helvetica-Bold').fontSize(24).fillColor(this.CLR_DARK).text('R', x, y, { continued: true });
    doc.fontSize(14).text('x', { continued: false });
    y = doc.y + 8;

    // Each medicine
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];

      if (y > this.PAGE_H - 150) {
        doc.addPage();
        y = this.M + 10;
      }

      // Medicine number + name (bold)
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(this.CLR_DARK)
        .text(`${i + 1}. ${med.medicine_name}`, x, y, { width: this.MAIN_W });
      y = doc.y + 3;

      // Dosage, timing, duration on one line
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(this.CLR_MED)
        .text(`${med.dosage}      ${med.timing}      ${med.duration}`, x + 15, y, { width: this.MAIN_W - 15 });
      y = doc.y + 2;

      // Notes in italic light color
      if (med.notes) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .fillColor(this.CLR_NOTE)
          .text(med.notes, x + 15, y, { width: this.MAIN_W - 15 });
        y = doc.y + 2;
      }

      y += 10;
    }

    return y;
  }

  private drawAdviceSection(doc: any, advice: string, y: number): number {
    const x = this.MAIN_L;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.CLR_DARK).text('Advice:', x, y, { width: this.MAIN_W });
    y = doc.y + 6;

    const items = advice.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
    doc.font('Helvetica').fontSize(10).fillColor(this.CLR_MED);
    for (const item of items) {
      doc.text(`•  ${item}`, x + 5, y, { width: this.MAIN_W - 10 });
      y = doc.y + 3;
    }

    return y;
  }

  private drawFooter(doc: any, doctor: any, y: number) {
    // Left: ISSUED BY
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(this.CLR_LIGHT)
      .text('ISSUED BY', this.INNER_L + 5, y);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(this.CLR_DARK)
      .text(doctor.name, this.INNER_L + 5, y + 12);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(this.CLR_MED)
      .text(doctor.specialization, this.INNER_L + 5, y + 26);

    // Right: SIGNATURE with dashed line
    const sigX = this.INNER_R - 150;
    doc
      .moveTo(sigX, y + 18)
      .lineTo(this.INNER_R - 10, y + 18)
      .dash(3, { space: 3 })
      .strokeColor(this.CLR_LIGHT)
      .lineWidth(0.5)
      .stroke()
      .undash();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(this.CLR_LIGHT)
      .text('SIGNATURE', this.INNER_R - 80, y + 24);
  }
}
