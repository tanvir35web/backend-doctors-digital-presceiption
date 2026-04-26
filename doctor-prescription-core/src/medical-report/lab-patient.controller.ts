import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientService } from '../patient/patient.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lab/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('lab')
export class LabPatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('search')
  async findByPhone(@Query('phone') phone: string) {
    const patient = await this.patientService.findByPhone(phone);
    return {
      message: 'Patient fetched successfully',
      data: patient,
    };
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const patient = await this.patientService.findById(id);
    return {
      message: 'Patient fetched successfully',
      data: patient,
    };
  }
}
