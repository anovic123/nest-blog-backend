import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  AuthDevice,
  AuthDeviceDocument,
  AuthDevicesDB,
} from '../domain/device.schema';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(AuthDevice.name)
    private AuthDeviceModel: Model<AuthDeviceDocument>,
  ) {}

  public async deleteSecuritySession(deviceId: string): Promise<boolean> {
    const result = await this.AuthDeviceModel.deleteOne({
      device_id: deviceId,
    });

    return result.deletedCount === 1;
  }

  public async updateSessionDate(
    date: string,
    deviceId: string,
  ): Promise<void> {
    await this.AuthDeviceModel.updateOne(
      { device_id: deviceId },
      { $set: { iat: date } },
    );
  }

  public async findSessionByDeviceId(deviceId: string) {
    return this.AuthDeviceModel.findOne({ device_id: deviceId });
  }

  public async createSession(data: AuthDevicesDB) {
    return this.AuthDeviceModel.create(data);
  }

  async deleteAllSessions(userId: string, device_id: string) {
    const deleteAllDevices = await this.AuthDeviceModel.deleteMany({
      user_id: userId,
      device_id: { $ne: device_id },
    });
    return deleteAllDevices.deletedCount > 0;
  }
}
