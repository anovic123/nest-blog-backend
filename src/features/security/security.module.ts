import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthDevice, authDeviceSchema } from './domain/device.schema';
import { SecurityController } from './api/security.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuthDevice.name,
        schema: authDeviceSchema,
      },
    ]),
  ],
  providers: [],
  controllers: [SecurityController],
  exports: [],
})
export class SecurityModule {}
