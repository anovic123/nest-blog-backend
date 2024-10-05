import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Comments, CommentsDocument } from '../domain/comments.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
  ) {}

  async checkIsOwn(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.CommentsModel.findOne({ id: commentId });

    if (!comment) return false;

    return comment.commentatorInfo.userId === userId;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.CommentsModel.deleteOne({ id: commentId });
    return result.deletedCount > 0;
  }
}
