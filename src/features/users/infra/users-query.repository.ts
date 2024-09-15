import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../domain/users.schema';

import { UserOutputType } from '../dto';
import { PaginatedResponse } from 'src/types';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  public async allUsers(
    query: any,
  ): Promise<PaginatedResponse<UserOutputType>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    } = query;

    const filter = {};

    if (searchLoginTerm) {
      filter['accountData.login'] = { $regex: searchLoginTerm, $options: 'i' };
    }

    if (searchEmailTerm) {
      filter['accountData.email'] = { $regex: searchEmailTerm, $options: 'i' };
    }

    try {
      const users = await this.UserModel.find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      const totalUsersCount = await this.UserModel.countDocuments(filter);

      return {
        pagesCount: Math.ceil(totalUsersCount / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalUsersCount,
        items: users.map((user: UserDocument) => this.outputModelUser(user)),
      };
    } catch (error) {
      console.error(error);
      return {
        pagesCount: 0,
        page: 0,
        pageSize: 0,
        totalCount: 0,
        items: [],
      };
    }
  }
  public outputModelUser(user: UserDocument): UserOutputType {
    return {
      id: user._id.toString(),
      createdAt: user.createdAt,
      email: user.email,
      login: user.login,
    };
  }
}
