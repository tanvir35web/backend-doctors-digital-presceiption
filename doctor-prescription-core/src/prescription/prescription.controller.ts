import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  create(@Request() req, @Body() createPrescriptionDto: CreatePrescriptionDto) {
    // TODO: Extract doctorId from JWT token after auth is implemented
    const doctorId = req.user?.id || 1; // Temporary fallback
    return this.prescriptionService.create(doctorId, createPrescriptionDto);
  }

  @Get()
  findAll(@Request() req, @Query('patientId') patientId?: string) {
    const doctorId = req.user?.id || 1; // Temporary fallback
    
    if (patientId) {
      return this.prescriptionService.findByPatient(parseInt(patientId));
    }
    
    return this.prescriptionService.findAll(doctorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    const doctorId = req.user?.id || 1; // Temporary fallback
    return this.prescriptionService.update(id, doctorId, updatePrescriptionDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const doctorId = req.user?.id || 1; // Temporary fallback
    return this.prescriptionService.remove(id, doctorId);
  }
}
