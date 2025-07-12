import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  constructor(private readonly prismaService: PrismaService) {}

  async createJob(
    createJobDto: CreateJobDto,
    companyId: string,
    recruiterProfileId: string,
  ) {
    console.log(
      'Creating job with data:',
      createJobDto,
      companyId,
      recruiterProfileId,
    );
    try {
      const job = await this.prismaService.job.create({
        data: {
          ...createJobDto, // Spreads title, description, location, etc.
          company: {
            connect: {
              id: companyId, // Connect to the company using its ID
            },
          },
          postedBy: {
            connect: {
              authId: recruiterProfileId, // Connect to the recruiter profile using its ID
            },
          },
        },
      });
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new InternalServerErrorException('Failed to create job');
    }
  }
  async listJobs() {
    try {
      const jobs = await this.prismaService.job.findMany({
        include: {
          company: true, // Include company details
          postedBy: true, // Include recruiter profile details
        },
      });
      return jobs;
    } catch (error) {
      console.error('Error listing jobs:', error);
      throw new InternalServerErrorException('Failed to list jobs');
    }
  }
}
