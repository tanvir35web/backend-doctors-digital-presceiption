import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from './lab.entity';
import { LabService } from './lab.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lab])],
  providers: [LabService],
  exports: [LabService, TypeOrmModule],
})
export class LabModule {}
