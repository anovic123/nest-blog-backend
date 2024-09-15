import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;

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
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    required: true,
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  @Prop({
    type: String,
    required: true,
    default: () => new Date().toISOString(),
  })
  createdAt: string;

  @Prop({
    type: String,
  })
  postId: string;
}

export const commentsSchema = SchemaFactory.createForClass(Comments);
