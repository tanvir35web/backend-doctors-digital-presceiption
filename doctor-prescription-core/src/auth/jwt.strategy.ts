import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DoctorService } from '../doctor/doctor.service';
import { LabService } from '../lab/lab.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly doctorService: DoctorService,
    private readonly labService: LabService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    if (payload.role === 'lab') {
      const lab = await this.labService.findByEmail(payload.email);
      if (!lab) {
        throw new UnauthorizedException('Lab not found');
      }
      return { id: lab.id, email: lab.email, name: lab.name, role: 'lab' };
    }

    // Default: doctor role (also handles old tokens without role field)
    const doctor = await this.doctorService.findByEmail(payload.email);
    if (!doctor) {
      throw new UnauthorizedException('Doctor not found');
    }
    return {
      id: doctor.id,
      email: doctor.email,
      name: doctor.name,
      role: 'doctor',
    };
  }
}
