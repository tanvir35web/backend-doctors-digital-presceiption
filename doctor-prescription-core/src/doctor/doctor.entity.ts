import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Prescription } from '../prescription/prescription.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password_hash: string;

  @Column()
  specialization: string;

  @Column()
  bmdc_reg_no: string;

  @Column()
  education: string;

  @Column()
  doctor_chamber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  visit_fee: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Prescription, (prescription) => prescription.doctor)
  prescriptions: Prescription[];
}
