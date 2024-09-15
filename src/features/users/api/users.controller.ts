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
} from '@nestjs/common';

import { UsersService } from '../application/users.service';

import { UsersQueryRepository } from '../infra/users-query.repository';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  public async getUsers(@Query() query: { [key: string]: string | undefined }) {
    return this.usersQueryRepository.allUsers(query);
  }

  @Post()
  public async registerUser(
    @Body() body: { login: string; password: string; email: string },
  ) {
    const newUser = await this.usersService.createUser(body);
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
