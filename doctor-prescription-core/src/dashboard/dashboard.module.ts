import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patient/patient.entity';
import { Prescription } from '../prescription/prescription.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Prescription])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
