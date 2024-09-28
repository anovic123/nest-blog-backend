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
import { EmailsManager } from 'src/core/managers/email.manager';
import { EmailModule } from 'src/core/email.module';
import { UsersQueryRepository } from '../users/infra/users-query.repository';
import { UsersRepository } from '../users/infra/users.repository';

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
    EmailModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    AuthService,
    AuthRepository,
    CryptoService,
    EmailsManager,
    UsersQueryRepository,
    UsersRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
