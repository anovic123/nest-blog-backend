import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../domain/users.schema';

import { getUsersHelper } from '../helper';
import { UserOutputType } from '../dto';

import { PaginatedResponse } from '../../../types';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  public async allUsers(
    query: any,
  ): Promise<PaginatedResponse<UserOutputType>> {
    const sanitizedQuery = getUsersHelper(query);

    const { searchLoginTerm, searchEmailTerm, sortBy, pageNumber, pageSize } =
      sanitizedQuery;

    const filter = {};

    const conditions: Record<string, any> = [];

    if (searchLoginTerm) {
      conditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      conditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    if (conditions.length > 0) {
      filter['$or'] = conditions;
    }

    try {
      const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
      const users = await this.UserModel.find(filter)
        .sort({ [sortBy]: sortDirection })
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
