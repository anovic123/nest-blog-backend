import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ConfigurationType } from 'src/settings/configuration';

export const fromUTF8ToBase64 = (code: string) => {
  const buff2 = Buffer.from(code, 'utf8');
  const codedAuth = buff2.toString('base64');
  return codedAuth;
};

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService<ConfigurationType, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    const base64Credentials = authHeader.slice(6).trim();

    const apiSettings = this.configService.get('apiSettings', { infer: true });

    const validBase64Credentials = fromUTF8ToBase64(
      `${apiSettings.ADMIN_LOGIN}:${apiSettings.ADMIN_PASSWORD}`,
    );
    if (base64Credentials !== validBase64Credentials) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
