/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../../base/types/request';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
