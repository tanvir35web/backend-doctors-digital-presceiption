import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { MedicalReportService } from '../medical-report/medical-report.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ApiResponse } from '../types/api-response.type';
import { Patient } from './patient.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('patients')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly medicalReportService: MedicalReportService,
  ) {}

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

  @Get('search')
  async findByPhone(
    @Query('phone') phone: string,
  ): Promise<ApiResponse<Patient>> {
    const patient = await this.patientService.findByPhone(phone);
    return {
      message: 'Patient fetched successfully',
      data: patient,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Patient>> {
    const patient = await this.patientService.findById(id);
    return {
      message: 'Patient fetched successfully',
      data: patient,
    };
  }

  @Get(':id/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('doctor')
  async getPatientReports(@Param('id', ParseIntPipe) id: number) {
    // Verify patient exists
    await this.patientService.findById(id);
    const reports = await this.medicalReportService.findByPatient(id);
    return {
      message: 'Patient reports fetched successfully',
      data: reports,
    };
  }
}
