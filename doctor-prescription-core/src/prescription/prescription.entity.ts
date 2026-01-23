import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { Medicine } from '../medicine/medicine.entity';
import { PrescriptionEmail } from '../prescription-email/prescription-email.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_id: number;

  @Column()
  patient_id: number;

  @Column({ type: 'text', nullable: true })
  chief_complaints: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  investigation: string;

  @Column({ type: 'text', nullable: true })
  advice: string;

  @Column({ nullable: true })
  pdf_url: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => Medicine, (medicine) => medicine.prescription)
  medicines: Medicine[];

  @OneToMany(() => PrescriptionEmail, (email) => email.prescription)
  emails: PrescriptionEmail[];
}
