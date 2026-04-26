import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicalReportService } from './medical-report.service';
import { UploadReportDto } from './dto/upload-report.dto';
import { reportMulterOptions } from './multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as path from 'path';
import * as fs from 'fs';

@Controller('lab/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('lab')
export class MedicalReportController {
  constructor(private readonly reportService: MedicalReportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', reportMulterOptions))
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadReportDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const report = await this.reportService.upload(req.user.id, file, dto);
    return {
      message: 'Report uploaded successfully',
      data: report,
    };
  }

  @Get()
  async findAll(@Request() req) {
    const reports = await this.reportService.findAllByLab(req.user.id);
    return {
      message: 'Reports fetched successfully',
      data: reports,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportService.findOne(id);
    return {
      message: 'Report fetched successfully',
      data: report,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.reportService.remove(id, req.user.id);
    return { message: 'Report deleted successfully' };
  }
}

// Separate controller for file downloads (accessible by both doctor and lab)
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportDownloadController {
  constructor(private readonly reportService: MedicalReportService) {}

  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const report = await this.reportService.findOne(id);
    const filePath = path.join(process.cwd(), report.file_url);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found on server');
    }

    res.download(filePath, report.original_filename);
  }
}
