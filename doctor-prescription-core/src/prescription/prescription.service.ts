import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from '../medicine/medicine.entity';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctor/doctor.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    doctorId: number,
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    // Verify patient exists
    const patient = await this.patientRepository.findOne({
      where: { id: createPrescriptionDto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify doctor exists
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Create prescription
    const prescription = this.prescriptionRepository.create({
      doctor_id: doctorId,
      patient_id: createPrescriptionDto.patient_id,
      chief_complaints: createPrescriptionDto.chief_complaints,
      investigation: createPrescriptionDto.investigation,
      diagnosis: createPrescriptionDto.diagnosis,
      advice: createPrescriptionDto.advice,
    });

    const savedPrescription =
      await this.prescriptionRepository.save(prescription);

    // Create medicines if provided
    if (
      createPrescriptionDto.medicines &&
      createPrescriptionDto.medicines.length > 0
    ) {
      const medicines = createPrescriptionDto.medicines.map((med) =>
        this.medicineRepository.create({
          prescription_id: savedPrescription.id,
          medicine_name: med.medicine_name,
          dosage: med.dosage,
          timing: med.timing,
          duration: med.duration,
          notes: med.notes,
        }),
      );
      await this.medicineRepository.save(medicines);
    }

    // Return prescription with relations
    return this.findOne(savedPrescription.id);
  }

  async findAll(doctorId: number): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { doctor_id: doctorId },
      relations: ['patient', 'doctor', 'medicines'],
      order: { created_at: 'DESC' },
    });
  }

  async findRecent(doctorId: number, limit = 10): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { doctor_id: doctorId },
      relations: ['patient', 'doctor', 'medicines'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'medicines'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async findByPatient(patientId: number): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { patient_id: patientId },
      relations: ['patient', 'doctor', 'medicines'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    doctorId: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id, doctor_id: doctorId },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found or unauthorized');
    }

    // Update prescription fields
    if (updatePrescriptionDto.chief_complaints !== undefined) {
      prescription.chief_complaints = updatePrescriptionDto.chief_complaints;
    }
    if (updatePrescriptionDto.investigation !== undefined) {
      prescription.investigation = updatePrescriptionDto.investigation;
    }
    if (updatePrescriptionDto.diagnosis !== undefined) {
      prescription.diagnosis = updatePrescriptionDto.diagnosis;
    }
    if (updatePrescriptionDto.advice !== undefined) {
      prescription.advice = updatePrescriptionDto.advice;
    }

    await this.prescriptionRepository.save(prescription);

    // Update medicines if provided
    if (updatePrescriptionDto.medicines) {
      // Delete existing medicines
      await this.medicineRepository.delete({ prescription_id: id });

      // Create new medicines
      if (updatePrescriptionDto.medicines.length > 0) {
        const medicines = updatePrescriptionDto.medicines.map((med) =>
          this.medicineRepository.create({
            prescription_id: id,
            medicine_name: med.medicine_name,
            dosage: med.dosage,
            timing: med.timing,
            duration: med.duration,
            notes: med.notes,
          }),
        );
        await this.medicineRepository.save(medicines);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, doctorId: number): Promise<void> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id, doctor_id: doctorId },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found or unauthorized');
    }

    await this.prescriptionRepository.remove(prescription);
  }
}
