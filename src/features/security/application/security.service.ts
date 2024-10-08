import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { SecurityRepository } from '../infra/security.repository';
import { JwtService } from '../../../core/adapters/jwt-service';
import { SecurityQueryRepository } from '../infra/security.query.repository';

@Injectable()
export class SecurityService {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly jwtService: JwtService,
    private readonly securityQueryRepository: SecurityQueryRepository,
  ) {}

  public async getUserByDeviceId(deviceId: string) {
    return this.securityRepository.findSessionByDeviceId(deviceId);
  }

  public async deleteSessionById(refreshToken: string, deviceId: string) {
    const refreshTokenData = await this.jwtService.getDataFromRefreshToken(
      refreshToken,
      this.securityRepository.findSessionByDeviceId.bind(
        this.securityRepository,
      ),
    );

    if (!refreshTokenData) {
      throw new UnauthorizedException();
    }

    const userId = refreshTokenData.userId;

    const checkDeviceUser = await this.securityRepository.checkUserDeviceById(
      userId,
      deviceId,
    );

    if (!checkDeviceUser) {
      throw new NotFoundException();
    }

    await this.securityRepository.deleteUserDeviceById(deviceId);
  }

  public async deleteAllSessions(refreshToken: string) {
    const refreshTokenData = await this.jwtService.getDataFromRefreshToken(
      refreshToken,
      this.securityRepository.findSessionByDeviceId.bind(
        this.securityRepository,
      ),
    );

    if (!refreshTokenData) {
      throw new UnauthorizedException();
    }

    const { userId, deviceId } = refreshTokenData;

    await this.securityRepository.deleteAllSessions(userId, deviceId);
  }

  public async getAllDevicesSessions(refreshToken: string) {
    const refreshTokenData = await this.jwtService.getDataFromRefreshToken(
      refreshToken,
      this.securityRepository.findSessionByDeviceId.bind(
        this.securityRepository,
      ),
    );

    if (!refreshTokenData) {
      throw new UnauthorizedException();
    }

    const { userId } = refreshTokenData;

    return this.securityQueryRepository.findSessionsByUserId(userId);
  }
}
