import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as SchemaMongoose } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  id: SchemaMongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  createdAt: string;
  @Prop({
    required: true,
  })
  login: string;
  @Prop({
    required: true,
  })
  email: string;
  @Prop({
    required: true,
  })
  password: string;
}

export const userSchema = SchemaFactory.createForClass(User);

export type UserModelType = Model<UserDocument>;
