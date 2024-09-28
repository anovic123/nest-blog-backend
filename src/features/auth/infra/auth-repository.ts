import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/features/users/domain/users.schema';

import { UserOutputModel } from '../api/models/output/user.output.model';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  public async createUser(user: User) {
    const result = await this.UserModel.create(user);

    return this.outputModelUser(result);
  }

  public outputModelUser(user: UserDocument): UserOutputModel {
    return {
      id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      email: user.accountData.email,
      login: user.accountData.login,
    };
  }
}
