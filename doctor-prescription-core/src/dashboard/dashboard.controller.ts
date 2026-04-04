import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req: { user?: { id: number } }) {
    const doctorId = req.user?.id || 1; // Temporary fallback until auth guards are wired
    const data = await this.dashboardService.getStats(doctorId);
    return {
      message: 'Dashboard statistics fetched successfully',
      data,
    };
  }
}
