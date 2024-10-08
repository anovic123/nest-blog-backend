import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersService } from './application/users.service';
import { CryptoService } from 'src/core/adapters/crypto-service';

import { UsersController } from './api/users.controller';

import { UsersRepository } from './infra/users.repository';
import { UsersQueryRepository } from './infra/users-query.repository';

import { User, userSchema } from './domain/users.schema';

import { AuthService } from '../auth/application/auth.service';
import { AuthRepository } from '../auth/infra/auth-repository';

import {
  EmailIsExistConstraint,
  LoginIsExistConstraint,
} from '../../core/decorators';
import { AdaptersModule } from '../../core/adapters/adapters.module';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
    CqrsModule,
    UsersModule,
    AdaptersModule,
  ],
  controllers: [UsersController],
  providers: [
    DeleteUserUseCase,
    UsersRepository,
    UsersQueryRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    UsersService,
    AuthRepository,
    AuthService,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
