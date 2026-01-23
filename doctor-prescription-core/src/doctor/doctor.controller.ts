/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import type { DoctorListResponse } from 'src/doctor/doctor.interface';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  getDoctorsList(): DoctorListResponse {
    return this.doctorService.getDoctorsList();
  }
}
