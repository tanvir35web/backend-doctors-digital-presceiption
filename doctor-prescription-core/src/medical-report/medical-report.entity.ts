import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lab } from '../lab/lab.entity';
import { Patient } from '../patient/patient.entity';

export enum ReportType {
  XRAY = 'xray',
  MRI = 'mri',
  CT_SCAN = 'ct_scan',
  BLOOD_TEST = 'blood_test',
  ULTRASOUND = 'ultrasound',
  OTHER = 'other',
}

export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
}

@Entity('medical_reports')
export class MedicalReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lab_id: number;

  @Column()
  patient_id: number;

  @Column({ type: 'enum', enum: ReportType })
  report_type: ReportType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  file_url: string;

  @Column({ type: 'enum', enum: FileType })
  file_type: FileType;

  @Column()
  original_filename: string;

  @Column({ type: 'date' })
  report_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Lab)
  @JoinColumn({ name: 'lab_id' })
  lab: Lab;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
