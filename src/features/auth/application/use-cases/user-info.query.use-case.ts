import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';

import { UsersRepository } from '../../../users/infra/users.repository';

import { UserInfoOutputModel } from '../../api/models/output/user-info.output.model';

export class GetUserInfoQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(query: GetUserInfoQuery): Promise<UserInfoOutputModel> {
    const { id } = query;

    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersRepository.findUserById(
      new Types.ObjectId(id),
    );

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userOutput = {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user._id.toString(),
    };

    return userOutput;
  }
}
