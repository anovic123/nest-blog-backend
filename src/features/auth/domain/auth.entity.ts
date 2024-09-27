import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserAccountDBType = {
  _id: MongooseSchema.Types.ObjectId;
  accountData: UserAccountType;
  emailConfirmation: EmailConfirmationType;
};

type EmailConfirmationType = {
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
};

type UserAccountType = {
  email: string;
  login: string;
  passwordHash: string;
  createdAt: Date;
};

@Schema()
export class UserAccount {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, required: true })
  accountData: UserAccountType;

  @Prop({ type: Object, required: true })
  emailConfirmation: EmailConfirmationType;
}

export type UserAccountDocument = UserAccount & Document;
export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
