import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { CompanyGuard } from 'src/company/guards/company.guard';
import { GetCompany } from 'src/auth/get-company.decorator';
import { Company } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('job')
@UseGuards(AuthGuard('jwt'))
export class JobController {
  constructor(private readonly jobService: JobService) {}
  @Post('create')
  @UseGuards(CompanyGuard)
  async createJob(
    @GetCompany() company: Company,
    @GetUser() user: { sub: string },
  ) {
    this.jobService.createJob(
      {
        title: 'New Job Title',
        description: 'Job Description',
        location: 'Job Location',
      },
      company.id,
      user.sub.split('|')[1].trim(),
    );
    return { message: 'Job created successfully' };
  }
  @Get('list')
  async listJobs() {
    const jobs = await this.jobService.listJobs();
    if (!jobs || jobs.length === 0) {
      return { message: 'No jobs found' };
    }
    return jobs;
  }
}
