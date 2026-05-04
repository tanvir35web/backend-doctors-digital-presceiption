import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../medical-report.entity';

export class UploadReportDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  patient_id: number;

  @IsEnum(ReportType)
  @IsNotEmpty()
  report_type: ReportType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  report_date: Date;
}
