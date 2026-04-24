import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionEmail } from './prescription-email.entity';
import { Prescription } from '../prescription/prescription.entity';
import { PrescriptionEmailService } from './prescription-email.service';
import { PrescriptionPdfService } from '../prescription/prescription-pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionEmail, Prescription])],
  providers: [PrescriptionEmailService, PrescriptionPdfService],
  exports: [PrescriptionEmailService, TypeOrmModule],
})
export class PrescriptionEmailModule {}
