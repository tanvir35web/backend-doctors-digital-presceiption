import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalReport, FileType } from './medical-report.entity';
import { UploadReportDto } from './dto/upload-report.dto';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MedicalReportService {
  constructor(
    @InjectRepository(MedicalReport)
    private readonly reportRepository: Repository<MedicalReport>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    labId: number,
    file: Express.Multer.File,
    dto: UploadReportDto,
  ): Promise<MedicalReport> {
    const isPdf = file.mimetype === 'application/pdf';
    const fileType = isPdf ? FileType.PDF : FileType.IMAGE;

    // Upload to Cloudinary (images) or keep local (PDFs)
    const fileUrl = await this.cloudinaryService.upload(file.path, isPdf);

    const report = this.reportRepository.create({
      lab_id: labId,
      patient_id: dto.patient_id,
      report_type: dto.report_type,
      title: dto.title,
      description: dto.description,
      file_url: fileUrl,
      file_type: fileType,
      original_filename: file.originalname,
      report_date: dto.report_date,
    });

    return this.reportRepository.save(report);
  }

  async findAllByLab(labId: number): Promise<MedicalReport[]> {
    return this.reportRepository.find({
      where: { lab_id: labId },
      relations: ['patient'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MedicalReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['lab', 'patient'],
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async findByPatient(patientId: number): Promise<MedicalReport[]> {
    return this.reportRepository.find({
      where: { patient_id: patientId },
      relations: ['lab'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: number, labId: number): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id, lab_id: labId },
    });
    if (!report) {
      throw new NotFoundException('Report not found or unauthorized');
    }

    await this.reportRepository.remove(report);
  }
}
