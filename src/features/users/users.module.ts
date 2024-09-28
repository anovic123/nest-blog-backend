import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { UsersService } from './application/users.service';
import { CryptoService } from 'src/core/application/crypto-service';

import { UsersController } from './api/users.controller';

import { UsersRepository } from './infra/users.repository';
import { UsersQueryRepository } from './infra/users-query.repository';

import { User, userSchema } from './domain/users.schema';
import {
  EmailIsExistConstraint,
  LoginIsExistConstraint,
} from 'src/common/decorators';

import { BasicAuthGuard } from 'src/core/infrastructure/guards/auth-basic.guard';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/application/auth.service';
import { AuthRepository } from '../auth/infra/auth-repository';
import { EmailsManager } from 'src/core/managers/email.manager';
import { EmailModule } from 'src/core/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
    UsersModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: BasicAuthGuard,
    // },
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    AuthRepository,
    AuthService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
