import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Prescription } from '../prescription/prescription.entity';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prescription_id: number;

  @Column()
  medicine_name: string;

  @Column()
  dosage: string;

  @Column()
  timing: string;

  @Column()
  duration: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Prescription, (prescription) => prescription.medicines)
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;
}
