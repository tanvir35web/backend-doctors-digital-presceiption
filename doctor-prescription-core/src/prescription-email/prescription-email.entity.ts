import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from '../prescription/prescription.entity';

@Entity('prescription_emails')
export class PrescriptionEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prescription_id: number;

  @Column()
  recipient_email: string;

  @CreateDateColumn()
  sent_at: Date;

  @Column()
  status: string;

  @ManyToOne(() => Prescription, (prescription) => prescription.emails)
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;
}
