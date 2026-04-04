import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existingPatient = await this.patientRepository.findOne({
      where: { phone: createPatientDto.phone },
    });

    if (existingPatient) {
      throw new ConflictException(
        'Patient with this phone number already exists',
      );
    }

    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
    return patient;
  }

  async findByPhone(phone: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { phone },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with phone number ${phone} not found`,
      );
    }
    return patient;
  }
}
