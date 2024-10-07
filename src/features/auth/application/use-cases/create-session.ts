import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import {
  JwtRefreshPayloadExtended,
  JwtService,
} from '../../../../core/adapters/jwt-service';

import { SecurityRepository } from '../../../security/infra/security.repository';

export class CreateSessionCommand {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly userAgent: string,
    public readonly ip: string,
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityRepository: SecurityRepository,
  ) {}

  async execute(command: CreateSessionCommand) {
    const { accessToken, refreshToken, userAgent, ip } = command;

    const payload =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        refreshToken,
      );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const newSession = await this.securityRepository.createSession({
      user_id: payload.userId,
      device_id: payload.deviceId,
      iat: new Date(payload.iat! * 1000).toISOString(),
      ip,
      exp: new Date(payload.exp! * 1000).toISOString(),
      device_name: userAgent,
    });
  }
}
