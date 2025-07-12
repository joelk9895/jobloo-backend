import { Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('company')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  getCompany(@GetUser() user: { sub: string }) {
    const authId = user.sub;
    return this.companyService.getCompanyDetails(authId);
  }
  @Put('me')
  updateCompany() {
    return { message: 'Company updated' };
  }
}
