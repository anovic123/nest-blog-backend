import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from '../application/users.service';
import { AuthService } from 'src/features/auth/application/auth.service';

import { SortingPropertiesType } from 'src/base/types/sorting-properties.type';

import { BasicAuthGuard } from 'src/core/infrastructure/guards/auth-basic.guard';

import { UserCreateModel } from './models/input/create-user.input.model';
import { PaginationWithSearchLoginAndEmailTerm } from 'src/base/models/pagination.base.model';
import { UserOutputModel } from './models/output/user.output.model';

import { UsersQueryRepository } from '../infra/users-query.repository';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly authService: AuthService,
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
    const newUser = await this.authService.createUser(createModel);
    if (!newUser) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return newUser;
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);

    if (!result) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return;
  }
}
