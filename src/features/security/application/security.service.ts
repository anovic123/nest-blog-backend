import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { SecurityRepository } from '../infra/security.repository';

@Injectable()
export class SecurityService {
  constructor(private readonly securityRepository: SecurityRepository) {}

  public async getUserByDeviceId(deviceId: string) {
    return this.securityRepository.findSessionByDeviceId(deviceId);
  }

  public async deleteSessionById(deviceId: string, userId: string) {
    if (!deviceId) {
      throw new NotFoundException();
    }

    const curSession = await this.getUserByDeviceId(deviceId);

    if (!curSession) {
      throw new NotFoundException();
    }

    if (userId !== curSession?.user_id) {
      throw new ForbiddenException();
    }

    return this.securityRepository.deleteSecuritySession(deviceId);
  }

  public async deleteAllSessions(userId: string, device_id: string) {
    if (!device_id || !userId) {
      throw new UnauthorizedException();
    }
    return await this.securityRepository.deleteAllSessions(userId, device_id);
  }
}
