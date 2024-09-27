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

import { UsersQueryRepository } from '../infra/users-query.repository';
import { PaginationWithSearchLoginAndEmailTerm } from 'src/base/models/pagination.base.model';
import { UserOutputModel } from './models/output/user.output.model';
import { SortingPropertiesType } from 'src/base/types/sorting-properties.type';
import { UserCreateModel } from './models/input/create-user.input.model';
import { BasicAuthGuard } from 'src/core/infrastructure/guards/auth-basic.guard';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  public async getUsers(@Query() query) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );
    return this.usersQueryRepository.allUsers(pagination);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  public async registerUser(@Body() createModel: UserCreateModel) {
    const newUser = await this.usersService.createUser(createModel);
    if (!newUser) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return newUser;
  }

  @UseGuards(BasicAuthGuard)
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
