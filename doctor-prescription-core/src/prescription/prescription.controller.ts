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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrescriptionService } from './prescription.service';
import { PrescriptionPdfService } from './prescription-pdf.service';
import { PrescriptionEmailService } from '../prescription-email/prescription-email.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
    private readonly pdfService: PrescriptionPdfService,
    private readonly emailService: PrescriptionEmailService,
  ) {}

  @Post()
  create(@Request() req, @Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(req.user.id, createPrescriptionDto);
  }

  @Get()
  findAll(@Request() req, @Query('patientId') patientId?: string) {
    if (patientId) {
      return this.prescriptionService.findByPatient(parseInt(patientId));
    }
    return this.prescriptionService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const prescription = await this.prescriptionService.findOne(id);
    const pdfBuffer = await this.pdfService.generatePdf(prescription);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/send-email')
  async sendEmail(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('email') email?: string,
  ) {
    const record = await this.emailService.sendPrescriptionEmail(
      id,
      req.user.id,
      email,
    );
    return {
      message: 'Prescription sent successfully',
      recipient: record.recipient_email,
      sent_at: record.sent_at,
    };
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, req.user.id, updatePrescriptionDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.remove(id, req.user.id);
  }
}
