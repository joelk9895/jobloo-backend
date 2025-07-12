import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      // This should not happen if AuthGuard is used correctly
      throw new NotFoundException(
        'User authentication data not found in request.',
      );
    }

    let authId = user.sub;
    authId = authId.split('|')[1].trim(); // Extract the first part of the authId if it contains a pipe

    // Find the user, their recruiter profile, and the company in one query
    const dbUser = await this.prisma.user.findUnique({
      where: { authId },
      include: {
        recruiterProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!dbUser?.recruiterProfile?.company) {
      throw new NotFoundException(
        'Company information not found for this user.',
      );
    }

    // Attach the fetched company object to the request
    request.company = dbUser.recruiterProfile.company;

    return true;
  }
}
