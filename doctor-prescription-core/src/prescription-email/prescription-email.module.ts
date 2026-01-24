import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionEmail } from './prescription-email.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionEmail])],
  exports: [TypeOrmModule],
})
export class PrescriptionEmailModule {}
