import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lab } from './lab.entity';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Lab)
    private readonly labRepository: Repository<Lab>,
  ) {}

  async findByEmail(email: string): Promise<Lab | null> {
    return this.labRepository.findOne({ where: { email } });
  }

  async create(labData: Partial<Lab>): Promise<Lab> {
    if (!labData.email) {
      throw new ConflictException('Email is required');
    }
    const existing = await this.findByEmail(labData.email);
    if (existing) {
      throw new ConflictException('Lab with this email already exists');
    }
    const lab = this.labRepository.create(labData);
    return this.labRepository.save(lab);
  }
}
