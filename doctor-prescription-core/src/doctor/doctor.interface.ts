import { ApiResponse } from 'src/types/api-response.type';

export interface Doctor {
  id: number;
  name: string;
  speciality: string;
  experience: string;
  image: string;
}

export type DoctorListResponse = ApiResponse<Doctor[]>;
