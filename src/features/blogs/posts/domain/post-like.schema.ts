import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum LikePostStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export type LikePostDocument = HydratedDocument<LikePost>;

@Schema()
export class LikePost {
  @Prop({
    required: true,
    type: String,
  })
  createdAt: string;
  @Prop({
    enum: LikePostStatus,
    required: true,
    type: String,
  })
  status: LikePostStatus;
  @Prop({
    type: String,
    required: true,
  })
  authorId: string;
  @Prop({
    type: String,
    required: true,
  })
  postId: string;
  @Prop({
    required: true,
    type: String,
  })
  login: string;
}

export const postLikeSchema = SchemaFactory.createForClass(LikePost);
