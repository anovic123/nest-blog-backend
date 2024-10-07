import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityRepository } from '../../../security/infra/security.repository';

import { JwtService } from 'src/core/adapters/jwt-service';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
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
  }> {
    const { userId, deviceId } = command;

    if (!userId || !deviceId) {
      throw new UnauthorizedException();
    }

    const device =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!device) {
      throw new UnauthorizedException();
    }

    const newTokens = await this.jwtService.createJWT(userId, deviceId);

    if (!newTokens) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = newTokens;

    const refreshTokenDecoded = await this.jwtService.verifyToken(refreshToken);

    if (!refreshTokenDecoded?.iat) {
      throw new UnauthorizedException();
    }

    const newIat = new Date(refreshTokenDecoded.iat * 1000).toISOString();

    await this.securityRepository.updateSessionDate(newIat, deviceId);

    return { accessToken, refreshToken };
  }
}
