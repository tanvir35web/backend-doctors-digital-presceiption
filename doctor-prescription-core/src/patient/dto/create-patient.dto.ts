import {
  IsString,
  IsNumber,
  IsEnum,
  IsPhoneNumber,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Gender } from '../patient.entity';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;
}
