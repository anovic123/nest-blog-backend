import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthDevice,
  AuthDeviceDocument,
  AuthDevicesDB,
} from '../domain/device.schema';
import { Model, Types } from 'mongoose';
import { DevicesSessionViewModel } from '../api/models/output.model';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(AuthDevice.name)
    private AuthDeviceModel: Model<AuthDeviceDocument>,
  ) {}

  public async findSessionsByUserId(userId: string) {
    const isValidId = Types.ObjectId.isValid(userId);
    console.log(userId);

    if (!isValidId) {
      return null;
    }

    const res = await this.AuthDeviceModel.find({
      user_id: new Types.ObjectId(userId),
    }).exec();

    return res.map(this.mapOutput);
  }

  public mapOutput(s: AuthDevicesDB): DevicesSessionViewModel {
    return {
      ip: s.ip,
      title: s.device_name,
      lastActiveDate: s.iat,
      deviceId: s.device_id,
    };
  }
}
