import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { UsersService } from './application/users.service';

import { UsersController } from './api/users.controller';
import { CryptoService } from './application/crypto.service';

import { UsersRepository } from './infra/users.repository';
import { UsersQueryRepository } from './infra/users-query.repository';

import { User, userSchema } from './domain/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
