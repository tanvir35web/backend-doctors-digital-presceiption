import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patient/patient.entity';
import { Prescription } from '../prescription/prescription.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async getStats(doctorId: number) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayPatients,
      totalPatients,
      todayIncomeResult,
      totalEarningResult,
    ] = await Promise.all([
      // Today's new patients
      this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.created_at >= :start AND patient.created_at <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getCount(),

      // Total patients
      this.patientRepository.count(),

      // Today's income: count of today's prescriptions × doctor's visit_fee
      this.prescriptionRepository
        .createQueryBuilder('prescription')
        .innerJoin('prescription.doctor', 'doctor')
        .select('COALESCE(SUM(doctor.visit_fee), 0)', 'total')
        .where('prescription.doctor_id = :doctorId', { doctorId })
        .andWhere(
          'prescription.created_at >= :start AND prescription.created_at <= :end',
          { start: todayStart, end: todayEnd },
        )
        .getRawOne() as Promise<{ total: number }>,

      // Total earning: all prescriptions × doctor's visit_fee
      this.prescriptionRepository
        .createQueryBuilder('prescription')
        .innerJoin('prescription.doctor', 'doctor')
        .select('COALESCE(SUM(doctor.visit_fee), 0)', 'total')
        .where('prescription.doctor_id = :doctorId', { doctorId })
        .getRawOne() as Promise<{ total: number }>,
    ]);

    return {
      today_patients: todayPatients,
      today_income: Number(todayIncomeResult?.total ?? 0),
      total_patients: totalPatients,
      total_earning: Number(totalEarningResult?.total ?? 0),
    };
  }
}
