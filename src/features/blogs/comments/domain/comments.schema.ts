import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeCommentStatus } from '../api/models/output';

export type CommentsDocument = HydratedDocument<Comments>;
export type LikeCommentsDocument = HydratedDocument<LikesComment>;

export class LikeCommentDBType {
  createdAt: Date;
  status: LikeCommentStatus;
  authorId: string;
  commentId: string;
  postId: string;
}

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

@Schema({})
export class LikesComment {
  @Prop({ type: Date, required: true })
  createdAt: string;

  @Prop({
    type: String,
    enum: LikeCommentStatus,
    required: true,
  })
  status: LikeCommentStatus;

  @Prop({
    type: String,
    required: true,
  })
  authorId: string;

  @Prop({
    type: String,
    required: true,
  })
  commentId: string;

  @Prop({
    type: String,
    required: true,
  })
  postId: string;
}

@Schema()
export class Comments {
  @Prop({
    type: String,
    required: true,
  })
  id: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: CommentatorInfo,
    required: true,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: String,
    required: true,
  })
  createdAt: string;

  @Prop({
    type: String,
    required: true,
  })
  postId: string;
}

export const commentsSchema = SchemaFactory.createForClass(Comments);
export const likesCommentsSchema = SchemaFactory.createForClass(LikesComment);
