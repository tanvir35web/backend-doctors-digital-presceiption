import { Controller, Post, Body, Get } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ApiResponse } from '../types/api-response.type';
import { Patient } from './patient.entity';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  async create(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<ApiResponse<Patient>> {
    const patient = await this.patientService.create(createPatientDto);
    return {
      message: 'Patient created successfully',
      data: patient,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse<Patient[]>> {
    const patients = await this.patientService.findAll();
    return {
      message: 'Patients fetched successfully',
      data: patients,
    };
  }
}
