import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { MedicineModule } from './medicine/medicine.module';
import { PrescriptionEmailModule } from './prescription-email/prescription-email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
      autoLoadEntities: true,
      synchronize: false,
    }),

    DoctorModule,
    PatientModule,
    PrescriptionModule,
    MedicineModule,
    PrescriptionEmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
