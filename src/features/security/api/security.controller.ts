import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RefreshTokenGuard } from 'src/core/guards/refresh-token.guard';

import { SecurityService } from '../application/security.service';
import { SecurityQueryRepository } from '../infra/security.query.repository';
import { RequestWithUser } from '../../../base/types/request';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly securityQueryRepository: SecurityQueryRepository,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  public async getAllDevices(@Req() request: RequestWithUser) {
    const refreshToken = request.cookies['refreshToken'];

    return this.securityService.getAllDevicesSessions(refreshToken);
  }

  // delete all sessions, but not current
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteAllOtherDevicesSessions(@Req() req: RequestWithUser) {
    const refreshToken = req.cookies['refreshToken'];

    return this.securityService.deleteAllSessions(refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteSessionByDeviceId(
    @Param('deviceId') deviceId: string,
    @Req() request: RequestWithUser,
  ) {
    const refreshToken = request.cookies['refreshToken'];

    return this.securityService.deleteSessionById(refreshToken, deviceId);
  }
}
