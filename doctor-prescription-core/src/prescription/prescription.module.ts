import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from '../medicine/medicine.entity';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctor/doctor.entity';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { PrescriptionPdfService } from './prescription-pdf.service';
import { PrescriptionEmailModule } from '../prescription-email/prescription-email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, Medicine, Patient, Doctor]),
    PrescriptionEmailModule,
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrescriptionPdfService],
  exports: [PrescriptionService, TypeOrmModule],
})
export class PrescriptionModule {}
