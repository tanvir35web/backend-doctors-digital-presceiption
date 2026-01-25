import { Controller, Get } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  async getDoctorsList(): Promise<Doctor[]> {
    return this.doctorService.getDoctorsList();
  }
}
