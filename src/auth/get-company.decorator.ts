import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export const GetCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const company = request.company; // Populated by CompanyGuard
    if (!company) {
      throw new Error('Company not found in request.');
    }
    return company;
  },
);
