import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { MedicalReport } from '../medical-report/medical-report.entity';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { MedicalReportService } from '../medical-report/medical-report.service';
import { CloudinaryService } from '../medical-report/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, MedicalReport])],
  controllers: [PatientController],
  providers: [PatientService, MedicalReportService, CloudinaryService],
  exports: [PatientService],
})
export class PatientModule {}
