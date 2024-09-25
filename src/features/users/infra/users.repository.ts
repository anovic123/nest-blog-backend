import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../domain/users.schema';

import { UserOutputModel } from '../api/models/output/user.output.model';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  public async createUser(user: UserCreateModel & { passwordHash: string }) {
    const result = await this.UserModel.create(user);

    return this.outputModelUser(result);
  }

  public async deleteUser(id: string): Promise<boolean> {
    const result = await this.UserModel.deleteOne({
      _id: new Types.ObjectId(id),
    });

    return result.deletedCount === 1;
  }

  async emailIsExist(email: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({ email: email }));
  }

  async loginIsExist(login: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({ login: login }));
  }

  public outputModelUser(user: UserDocument): UserOutputModel {
    return {
      id: user._id.toString(),
      createdAt: user.createdAt,
      email: user.email,
      login: user.login,
    };
  }
}
