import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyDetails(authId: string) {
    authId = authId.split('|')[1].trim(); // Extract the first part of the authId if it contains a pipe
    console.log('Auth ID:', authId);
    const user = await this.prisma.user.findUnique({
      where: { authId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // 2. Find the recruiter profile using the internal user ID
    const recruiterProfile = await this.prisma.recruiterProfile.findUnique({
      where: { userId: user.id },
    });

    if (!recruiterProfile) {
      throw new NotFoundException('Recruiter profile not found for this user.');
    }

    // 3. Fetch the company details
    const company = await this.prisma.company.findUnique({
      where: { id: recruiterProfile.companyId },
      include: {
        // Optionally include related data
        jobs: {
          where: { status: 'OPEN' }, // Example: only include open jobs
        },
        recruiters: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(
        'Company not found for the recruiter profile.',
      );
    }

    return company;
  }
}
