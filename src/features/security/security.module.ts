import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthDevice, authDeviceSchema } from './domain/device.schema';

import { SecurityController } from './api/security.controller';

import { SecurityService } from './application/security.service';

import { SecurityRepository } from './infra/security.repository';
import { SecurityQueryRepository } from './infra/security.query.repository';
import { UsersModule } from '../users/users.module';
import { JwtService } from '../../core/adapters/jwt-service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: AuthDevice.name,
        schema: authDeviceSchema,
      },
    ]),
  ],
  providers: [
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    JwtService,
  ],
  controllers: [SecurityController],
  exports: [SecurityRepository],
})
export class SecurityModule {}
