import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../domain/users.schema';

import { UserInputModel, UserOutputType } from '../dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  public async createUser(user: UserInputModel & { passwordHash: string }) {
    try {
      const result = await this.UserModel.create(user);

      if (!result) {
        throw new Error('Error while creating user');
      }

      return this.outputModelUser(result);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteOne({
        _id: new Types.ObjectId(id),
      });

      return result.deletedCount === 1;
    } catch (error) {
      throw new Error(error);
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
