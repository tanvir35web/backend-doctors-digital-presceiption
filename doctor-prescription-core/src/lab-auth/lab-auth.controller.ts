import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LabAuthService } from './lab-auth.service';
import { RegisterLabDto } from './dto/register-lab.dto';
import { LoginLabDto } from './dto/login-lab.dto';

@Controller('lab/auth')
export class LabAuthController {
  constructor(private readonly labAuthService: LabAuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterLabDto) {
    return this.labAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginLabDto) {
    return this.labAuthService.login(loginDto);
  }
}
