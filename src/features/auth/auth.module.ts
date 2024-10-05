import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthController } from './api/auth.controller';

import { AuthService } from './application/auth.service';

import { AuthRepository } from './infra/auth-repository';
import { UsersQueryRepository } from '../users/infra/users-query.repository';
import { UsersRepository } from '../users/infra/users.repository';

import {
  EmailIsExistConstraint,
  LoginIsExistConstraint,
} from 'src/core/decorators';

import { AdaptersModule } from 'src/core/adapters/adapters.module';

import { User, userSchema } from '../users/domain/users.schema';

import { GetUserInfoHandler } from './application/use-cases/user-info.query.use-case';
import { ResendCodeCommandUseCase } from './application/use-cases/resend-code.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { NewPasswordUseCase } from './application/use-cases/new-password.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';

@Module({
  imports: [
    AdaptersModule,
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
  ],
  providers: [
    ResendCodeCommandUseCase,
    CreateUserUseCase,
    ConfirmEmailUseCase,
    NewPasswordUseCase,
    PasswordRecoveryUseCase,
    GetUserInfoHandler,

    AuthService,
    AuthRepository,
    UsersQueryRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    UsersRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
