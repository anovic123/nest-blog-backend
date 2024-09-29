import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class UserAccountData {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;
}

@Schema()
export class EmailConfirmation {
  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;

  @Prop({ type: String, required: true })
  confirmationCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;
}

@Schema()
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ type: UserAccountData, required: true })
  accountData: UserAccountData;

  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: Date, required: true })
  createdAt: Date;
}

export const userSchema = SchemaFactory.createForClass(User);
