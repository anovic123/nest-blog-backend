import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';

import {
  JwtRefreshPayloadExtended,
  JwtService,
} from '../../../../core/adapters/jwt-service';

import { SecurityRepository } from '../../../security/infra/security.repository';

import { User } from '../../../users/domain/users.schema';

export class CreateSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityRepository: SecurityRepository,
  ) {}

  async execute(command: CreateSessionCommand) {
    const { userId, ip, userAgent } = command;

    const deviceId = uuidv4();

    const tokens = await this.jwtService.createJWT(userId, deviceId);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    await this.securityRepository.insertNewUserDevice({
      ip,
      user_id: userId,
      device_id: deviceId,
      device_name: userAgent,
      exp: tokens.refreshTokenExp,
    });

    const { accessToken, refreshToken } = tokens;

    return {
      accessToken,
      refreshToken,
    };
  }
}
