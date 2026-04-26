import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { PrescriptionEmail } from './prescription-email.entity';
import { Prescription } from '../prescription/prescription.entity';
import { PrescriptionPdfService } from '../prescription/prescription-pdf.service';

@Injectable()
export class PrescriptionEmailService {
  constructor(
    @InjectRepository(PrescriptionEmail)
    private emailRepository: Repository<PrescriptionEmail>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    private readonly mailerService: MailerService,
    private readonly pdfService: PrescriptionPdfService,
  ) {}

  async sendPrescriptionEmail(
    prescriptionId: number,
    doctorId: number,
    recipientEmail?: string,
  ): Promise<PrescriptionEmail> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id: prescriptionId, doctor_id: doctorId },
      relations: ['patient', 'doctor', 'medicines'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found or unauthorized');
    }

    const email = recipientEmail || prescription.patient.email;
    if (!email) {
      throw new NotFoundException(
        'No email address found. Provide recipientEmail or update patient email.',
      );
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generatePdf(prescription);

    // Send email
    await this.mailerService.sendMail({
      to: email,
      subject: `Prescription from  ${prescription.doctor.name}`,
      text: `Dear ${prescription.patient.name},\n\nPlease find your prescription attached.\n\nRegards,\n ${prescription.doctor.name}\n${prescription.doctor.specialization}`,
      attachments: [
        {
          filename: `prescription-${prescriptionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // Log the email
    const emailRecord = this.emailRepository.create({
      prescription_id: prescriptionId,
      recipient_email: email,
      status: 'sent',
    });

    return this.emailRepository.save(emailRecord);
  }
}
