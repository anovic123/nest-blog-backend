import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({
    required: true,
    type: String,
    max: 30,
  })
  title: string;
  @Prop({
    required: true,
    type: String,
    max: 100,
  })
  shortDescription: string;
  @Prop({
    required: true,
    type: String,
    max: 1000,
  })
  content: string;
  @Prop({
    required: true,
    type: String,
  })
  blogId: string;
  @Prop({
    required: true,
    type: String,
  })
  blogName: string;
  @Prop({
    required: true,
    type: String,
  })
  createdAt: string;
  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;
}

export const postSchema = SchemaFactory.createForClass(Post);
