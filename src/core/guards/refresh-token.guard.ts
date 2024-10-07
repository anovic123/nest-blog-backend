/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsersRepository } from '../../features/users/infra/users.repository';
import { JwtRefreshPayloadExtended, JwtService } from '../adapters/jwt-service';
import { Types } from 'mongoose';
import { RequestWithUser } from '../../base/types/request';
import { SecurityRepository } from '../../features/security/infra/security.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly securityRepository: SecurityRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshTokenData =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        refreshToken,
      );
    if (!refreshTokenData) {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findUserById(
      new Types.ObjectId(refreshTokenData.userId),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const userId = refreshTokenData.userId.toString();
    const deviceId = refreshTokenData.deviceId;

    const session =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!session?.iat) {
      throw new UnauthorizedException();
    }
    if (new Date(+session.iat) < new Date()) {
      throw new UnauthorizedException();
    }

    request.userId = userId;
    request.deviceId = deviceId;

    return true;
  }
}
