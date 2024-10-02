import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './api/auth.controller';

import { AuthService } from './application/auth.service';

import { CryptoService } from 'src/core/application/crypto-service';

import { AuthRepository } from './infra/auth-repository';
import { User, userSchema } from '../users/domain/users.schema';
import { EmailsManager } from 'src/core/managers/email.manager';
import { EmailModule } from 'src/core/email.module';
import { UsersQueryRepository } from '../users/infra/users-query.repository';
import { UsersRepository } from '../users/infra/users.repository';
import {
  EmailIsExistConstraint,
  LoginIsExistConstraint,
} from 'src/common/decorators';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'qwqweqeqe123',
      signOptions: { expiresIn: '500s' },
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
    AuthService,
    AuthRepository,
    CryptoService,
    EmailsManager,
    UsersQueryRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    UsersRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
