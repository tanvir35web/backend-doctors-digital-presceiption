import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { email } });
  }

  async create(doctorData: Partial<Doctor>): Promise<Doctor> {
    if (!doctorData.email) {
      throw new ConflictException('Email is required');
    }
    const existingDoctor = await this.findByEmail(doctorData.email);
    if (existingDoctor) {
      throw new ConflictException('Doctor with this email already exists');
    }
    const doctor = this.doctorRepository.create(doctorData);
    return this.doctorRepository.save(doctor);
  }

  async getDoctorsList(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }
}
