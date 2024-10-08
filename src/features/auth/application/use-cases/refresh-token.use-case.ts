import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityRepository } from '../../../security/infra/security.repository';

import {
  JwtRefreshPayloadExtended,
  JwtService,
} from 'src/core/adapters/jwt-service';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(public readonly requestRefreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExp: string;
  }> {
    const { requestRefreshToken } = command;

    const decodedToken =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        requestRefreshToken,
      );

    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const { deviceId, exp: decodedExp } = decodedToken;

    const deviceData =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!deviceData) {
      throw new UnauthorizedException();
    }

    const isTokenExpired =
      decodedExp &&
      new Date(decodedExp * 1000) < new Date(deviceData.lastActiveDate);

    if (isTokenExpired) {
      throw new UnauthorizedException();
    }

    const newAccessToken = this.jwtService._signAccessToken(
      decodedToken.userId,
    );
    const newRefreshToken = this.jwtService._signRefreshToken(
      decodedToken.userId,
      deviceId,
    );

    const { exp: newRefreshTokenExp } =
      this.jwtService.decodeToken(newRefreshToken);

    if (!newRefreshTokenExp) {
      throw new UnauthorizedException();
    }

    await this.securityRepository.updateSessionUser(
      decodedToken.userId,
      deviceId,
      newRefreshTokenExp,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExp: new Date(newRefreshTokenExp * 1000).toISOString(),
    };
  }
}