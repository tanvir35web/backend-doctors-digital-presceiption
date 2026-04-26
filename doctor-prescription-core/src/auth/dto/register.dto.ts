import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsString()
  @IsNotEmpty()
  bmdc_reg_no: string;

  @IsString()
  @IsNotEmpty()
  education: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  doctor_chamber: string;

  @IsNumber()
  @IsPositive()
  visit_fee: number;
}
