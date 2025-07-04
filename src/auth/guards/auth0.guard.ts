import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GetVerificationKey, expressjwt as jwt } from 'express-jwt';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class Auth0Guard implements CanActivate {
  private readonly jwksClient: JwksClient;

  constructor() {
    this.jwksClient = new JwksClient({
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const jwtMiddleware = jwt({
      secret: this.getSecret(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });

    return new Promise((resolve, reject) => {
      jwtMiddleware(req, res, (err) => {
        if (err) {
          return reject(new UnauthorizedException(err.message));
        }
        resolve(true);
      });
    });
  }

  private getSecret(): GetVerificationKey {
    return (req, token) => {
      if (!token || !token.header) {
        return Promise.reject(new Error('Invalid token or token header'));
      }
      const { kid } = token.header;
      return new Promise((resolve, reject) => {
        this.jwksClient.getSigningKey(kid, (err, key) => {
          if (err) {
            return reject(err);
          }
          if (!key) {
            return reject(new Error('Signing key not found'));
          }
          const signingKey = key.getPublicKey();
          resolve(signingKey);
        });
      });
    };
  }
}
