import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('labs')
export class Lab {
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
  phone: string;

  @Column()
  address: string;

  @Column()
  license_no: string;

  @CreateDateColumn()
  created_at: Date;
}
