import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { add } from 'date-fns';

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

  public async emailIsExist(email: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({
      'accountData.email': email,
    }));
  }

  public async loginIsExist(login: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({
      'accountData.login': login,
    }));
  }

  public async updateConfirmation(_id: User['_id']): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    return result.modifiedCount === 1;
  }

  public async updateUserConfirmationCode(
    _id: string,
    newCode: string,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id },
      {
        $set: {
          'emailConfirmation.confirmationCode': newCode,
          'emailConfirmation.expirationDate': add(new Date(), {
            hours: 1,
            minutes: 3,
          }),
        },
      },
    );

    return result.modifiedCount === 1;
  }

  public async findUserById(id: User['_id']): Promise<User | null> {
    const user = await this.UserModel.findOne({
      _id: id,
    });

    return user ? user?.toObject() : null;
  }

  public async updateUserPasswordHash(
    _id: Types.ObjectId,
    newPasswordHash: string,
  ): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { _id },
      {
        $set: {
          'accountData.passwordHash': newPasswordHash,
          'emailConfirmation.expirationDate': new Date(),
        },
      },
    );

    return res.modifiedCount === 1;
  }
}
