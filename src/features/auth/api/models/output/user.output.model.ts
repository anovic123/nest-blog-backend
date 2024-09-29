import { UserDocument } from 'src/features/users/domain/users.schema';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export const UserOutputModelMapper = (user: UserDocument): UserOutputModel => {
  const outputModel = new UserOutputModel();

  outputModel.id = user._id.toString();
  outputModel.login = user.accountData.login;
  outputModel.email = user.accountData.email;
  outputModel.createdAt = user.createdAt.toString();

  return outputModel;
};
