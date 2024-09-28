import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../domain/users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
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
}
