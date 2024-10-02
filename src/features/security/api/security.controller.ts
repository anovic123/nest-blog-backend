import { Controller, Delete, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('security')
export class SecurityController {
  constructor() {}

  @Get('/devices')
  public getAllDevices(@Req() request: Request) {
    console.log(request.cookies);
  }

  // delete all sessions, but not current
  @Delete('/devices')
  public deleteDevicesSessions() {}

  @Delete('/devices/:deviceId')
  public deleteSessionByDeviceId() {}
}
