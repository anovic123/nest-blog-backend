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

  public async deleteUserDeviceById(deviceId: string): Promise<boolean> {
    const res = await this.AuthDeviceModel.deleteOne({
      device_id: deviceId,
    });

    return res.deletedCount === 1;
  }

  public async updateSessionUser(
    userId: string,
    deviceId: string,
    refreshTokenExp: any,
  ): Promise<void> {
    await this.AuthDeviceModel.updateOne(
      { device_id: deviceId, user_id: userId },
      { $set: { exp: refreshTokenExp } },
    );
  }

  public async findSessionByDeviceId(deviceId: string) {
    const deviceRes = await this.AuthDeviceModel.findOne({
      device_id: deviceId,
    });
    console.log(deviceRes);

    return deviceRes ? this._mapDeviceSession(deviceRes) : null;
  }

  public async insertNewUserDevice(data: AuthDevicesDB) {
    return this.AuthDeviceModel.create(data);
  }

  public async deleteAllSessions(userId: string, device_id: string) {
    const deleteAllDevices = await this.AuthDeviceModel.deleteMany({
      user_id: userId,
      device_id: { $ne: device_id },
    });
    return deleteAllDevices.deletedCount > 0;
  }

  protected _mapDeviceSession(deviceSession: AuthDevicesDB) {
    return {
      deviceId: deviceSession.device_id,
      title: deviceSession.device_name,
      lastActiveDate: deviceSession.exp,
      ip: deviceSession.ip,
    };
  }

  public async checkUserDeviceById(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      const deviceRes = await this.AuthDeviceModel.findOne<{
        user_id: string;
        device_id: string;
      }>({ user_id: userId, device_id: deviceId }).exec();

      return deviceRes !== null;
    } catch (error) {
      console.error('Error in checkUserDeviceById:', error);
      return false;
    }
  }
}
