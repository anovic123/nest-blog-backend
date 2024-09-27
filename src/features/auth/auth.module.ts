import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './api/auth.controller';

import { AuthGuard } from 'src/core/infrastructure/guards/auth.guard';

import { AuthService } from './application/auth.service';

import { CryptoService } from 'src/core/application/crypto-service';

import { AuthRepository } from './infra/auth-repository';
import { User, userSchema } from '../users/domain/users.schema';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'qwqweqeqe123',
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    AuthRepository,
    CryptoService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
