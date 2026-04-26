import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LabService } from '../lab/lab.service';
import { RegisterLabDto } from './dto/register-lab.dto';
import { LoginLabDto } from './dto/login-lab.dto';
import * as bcrypt from 'bcrypt';
import { Lab } from '../lab/lab.entity';

@Injectable()
export class LabAuthService {
  constructor(
    private readonly labService: LabService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterLabDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const lab = await this.labService.create({
      ...registerDto,
      password_hash: hashedPassword,
    });

    const token = this.generateToken(lab);
    return {
      message: 'Registration successful',
      lab: {
        id: lab.id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone,
        address: lab.address,
        license_no: lab.license_no,
      },
      access_token: token,
    };
  }

  async login(loginDto: LoginLabDto) {
    const lab = await this.labService.findByEmail(loginDto.email);
    if (!lab) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      lab.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(lab);
    return {
      message: 'Login successful',
      lab: {
        id: lab.id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone,
        address: lab.address,
        license_no: lab.license_no,
      },
      access_token: token,
    };
  }

  private generateToken(lab: Lab) {
    const payload = { sub: lab.id, email: lab.email, role: 'lab' };
    return this.jwtService.sign(payload);
  }
}
