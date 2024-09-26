import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { appSettings } from 'src/settings/app-settings';

export const fromUTF8ToBase64 = (code: string) => {
  const buff2 = Buffer.from(code, 'utf8');
  const codedAuth = buff2.toString('base64');
  return codedAuth;
};

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    const base64Credentials = authHeader.slice(6).trim();
    const validBase64Credentials = fromUTF8ToBase64(
      `${appSettings.api.ADMIN_LOGIN}:${appSettings.api.ADMIN_PASSWORD}`,
    );
    console.log(validBase64Credentials);
    console.log(base64Credentials);
    if (base64Credentials !== validBase64Credentials) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
