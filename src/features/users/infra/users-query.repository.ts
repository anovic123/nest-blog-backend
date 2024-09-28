import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../domain/users.schema';

import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from 'src/base/models/pagination.base.model';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  public async allUsers(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    const filters: FilterQuery<User>[] = [];

    if (pagination.searchEmailTerm) {
      filters.push({
        email: { $regex: pagination.searchEmailTerm, $options: 'i' },
      });
    }

    if (pagination.searchLoginTerm) {
      filters.push({
        login: { $regex: pagination.searchLoginTerm, $options: 'i' },
      });
    }

    const filter: FilterQuery<User> = {};

    if (filters.length > 0) {
      filter.$or = filters;
    }

    return await this.__getResult(filter, pagination);
  }

  public async findUserByConfirmationCode(code: string): Promise<User | null> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    return user ? (user.toObject() as User) : null;
  }

  public async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<User | null> {
    const user = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        {
          'accountData.email': loginOrEmail,
        },
      ],
    });

    return user ? user.toObject() : null;
  }

  private async __getResult(
    filter: FilterQuery<User>,
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    const users = await this.UserModel.find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const mappedPosts = users.map(UserOutputModelMapper);

    return new PaginationOutput<UserOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
