import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [DoctorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
