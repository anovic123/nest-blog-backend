import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';

import { ConfigurationType } from 'src/settings/configuration';

interface JwtPayload {
  userId: string;
  email: string;
  login: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService<ConfigurationType, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        try {
          const apiSettings = this.configService.get('apiSettings', {
            infer: true,
          });

          const payload = await this.jwtService.verifyAsync(token, {
            secret: apiSettings.JWT_SECRET,
          });
          request['user'] = payload as JwtPayload;
        } catch {
          return true;
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const apiSettings = this.configService.get('apiSettings', {
        infer: true,
      });

      const payload = await this.jwtService.verifyAsync(token, {
        secret: apiSettings.JWT_SECRET,
      });
      request['user'] = payload as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
