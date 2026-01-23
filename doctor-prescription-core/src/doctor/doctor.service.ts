import { Injectable } from '@nestjs/common';
import { Doctor, DoctorListResponse } from './doctor.interface';

@Injectable()
export class DoctorService {
  private doctors: Array<Doctor> = [
    {
      id: 1,
      name: 'Dr. John Doe',
      speciality: 'Cardiology',
      experience: '10 years',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Dr. Jane Smith',
      speciality: 'Dermatology',
      experience: '5 years',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Dr. Michael Johnson',
      speciality: 'Orthopedics',
      experience: '15 years',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: 'Dr. Sarah Williams',
      speciality: 'Neurology',
      experience: '8 years',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 5,
      name: 'Dr. David Brown',
      speciality: 'Pediatrics',
      experience: '12 years',
      image: 'https://via.placeholder.com/150',
    },
  ];

  getDoctorsList(): DoctorListResponse {
    return {
      message: 'Doctors List fetched successfully',
      data: this.doctors,
    };
  }
}
