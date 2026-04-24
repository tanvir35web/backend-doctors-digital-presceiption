import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DoctorService } from '../doctor/doctor.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly doctorService: DoctorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const doctor = await this.doctorService.findByEmail(payload.email);
    if (!doctor) {
      throw new UnauthorizedException('Doctor not found');
    }
    return { id: doctor.id, email: doctor.email, name: doctor.name };
  }
}
