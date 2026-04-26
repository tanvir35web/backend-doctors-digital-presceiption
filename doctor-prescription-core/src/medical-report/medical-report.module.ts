import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalReport } from './medical-report.entity';
import { MedicalReportService } from './medical-report.service';
import {
  MedicalReportController,
  ReportDownloadController,
} from './medical-report.controller';
import { LabPatientController } from './lab-patient.controller';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalReport]), PatientModule],
  controllers: [
    MedicalReportController,
    ReportDownloadController,
    LabPatientController,
  ],
  providers: [MedicalReportService],
  exports: [MedicalReportService, TypeOrmModule],
})
export class MedicalReportModule {}
