import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService, // Assuming PrismaService is imported and available
  ) {}

  async signUp(email: string, password: string) {
    const domain = this.config.get<string>('AUTH0_DOMAIN');
    const clientId = this.config.get<string>('AUTH0_CLIENT_ID');
    const connection = this.config.get<string>('AUTH0_CONNECTION');

    try {
      const response = await fetch(`https://${domain}/dbconnections/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          email,
          password,
          connection,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign-up failed:', errorData);
        return `Sign-up failed - ${errorData.description || 'Unknown error'}`;
      }
      if (response.ok) {
        try {
          const newRecruiter = await this.prisma.$transaction(async (tx) => {
            console.log('Inside Prisma transaction. Creating company...');
            const company = await tx.company.create({
              data: {
                name: 'Test',
              },
            });
            console.log('Company created:', company.id);

            console.log('Creating user...');
            const firstName = 'John'; // Replace with actual first name
            const lastName = 'Doe'; // Replace with actual last name
            // Parse the Auth0 response to get the user ID
            const auth0Data = await response.json();
            const user = await tx.user.create({
              data: {
                authId: auth0Data._id || auth0Data.user_id || '', // The user ID from Auth0
                email,
                firstName,
                lastName,
                role: 'RECRUITER',
              },
            });
            console.log('User created:', user.id);

            console.log('Creating recruiter profile...');
            const recruiterProfile = await tx.recruiterProfile.create({
              data: {
                userId: user.id,
                companyId: company.id,
              },
            });
            console.log('Recruiter profile created:', recruiterProfile.id);

            return { user, company, recruiterProfile };
          });

          console.log('Prisma transaction successful!');
          return newRecruiter;
        } catch (error) {
          console.error('Error creating company:', error);
          return 'Sign-up failed - Error creating company';
        }
        return 'Sign-up successful';
      }
    } catch (error) {
      return 'Sign-up failed';
    }
  }

  async signIn(email: string, password: string) {
    const domain = this.config.get<string>('AUTH0_DOMAIN');
    const clientId = this.config.get<string>('AUTH0_CLIENT_ID');
    const clientSecret = this.config.get<string>('AUTH0_CLIENT_SECRET');
    const audience = this.config.get<string>('AUTH0_AUDIENCE');
    const bodyParams = new URLSearchParams({
      grant_type: 'password',
      username: email,
      password,
      scope: 'openid profile email',
    });

    if (audience) {
      bodyParams.append('audience', audience);
    }
    if (clientId) {
      bodyParams.append('client_id', clientId);
    }
    if (clientSecret) {
      bodyParams.append('client_secret', clientSecret);
    }

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Sign-in failed:', data);
      throw new Error(data.error_description || 'Unknown sign-in error');
    }
    console.log('Sign-in successful:', data);
    return data;
  }
}
