import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DoctorService } from '../doctor/doctor.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Doctor } from '../doctor/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const doctor = await this.doctorService.create({
      ...registerDto,
      password_hash: hashedPassword,
    });

    const token = this.generateToken(doctor);
    return {
      message: 'Registration successful',
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const doctor = await this.doctorService.findByEmail(loginDto.email);
    if (!doctor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      doctor.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(doctor);
    return {
      message: 'Login successful',
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
      access_token: token,
    };
  }

  private generateToken(doctor: Doctor) {
    const payload = { sub: doctor.id, email: doctor.email };
    return this.jwtService.sign(payload);
  }
}
