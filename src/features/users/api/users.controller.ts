import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UsersService } from '../application/users.service';
import { AuthService } from 'src/features/auth/application/auth.service';

import { SortingPropertiesType } from 'src/base/types/sorting-properties.type';

import { BasicAuthGuard } from 'src/core/guards/auth-basic.guard';

import { UserCreateModel } from './models/input/create-user.input.model';
import { PaginationWithSearchLoginAndEmailTerm } from 'src/base/models/pagination.base.model';
import { UserOutputModel } from './models/output/user.output.model';

import { UsersQueryRepository } from '../infra/users-query.repository';

import { CreateUserCommand } from '../../auth/application/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  public async getUsers(@Query() query) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );
    return this.usersQueryRepository.allUsers(pagination);
  }

  @Post()
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
