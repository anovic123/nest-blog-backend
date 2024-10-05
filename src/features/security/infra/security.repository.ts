import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AuthDevice, AuthDeviceDocument } from '../domain/device.schema';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(AuthDevice.name)
    private AuthDeviceModel: Model<AuthDeviceDocument>,
  ) {}
}
