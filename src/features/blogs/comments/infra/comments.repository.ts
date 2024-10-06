import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Comments,
  CommentsDocument,
  LikeCommentsDocument,
  LikesComment,
} from '../domain/comments.schema';
import { LikeCommentStatus } from '../api/models/output';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name)
    private readonly CommentsModel: Model<CommentsDocument>,
    @InjectModel(LikesComment.name)
    private LikesCommentModel: Model<LikeCommentsDocument>,
  ) {}

  public async checkIsOwn(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.CommentsModel.findOne({ id: commentId });

    if (!comment) return false;

    return comment.commentatorInfo.userId === userId;
  }

  public async isExistedComment(commentId: string): Promise<boolean> {
    const res = await this.CommentsModel.find({ id: commentId });

    return res.length > 0;
  }

  public async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.CommentsModel.deleteOne({ id: commentId });
    return result.deletedCount > 0;
  }

  public async updateComment(commentId: string, body: string) {
    const result = await this.CommentsModel.updateOne(
      {
        id: commentId,
      },
      {
        $set: { content: body },
      },
    );

    return result.modifiedCount > 0;
  }

  public async getPostIdByCommentId(id: string): Promise<string | null> {
    const res = await this.CommentsModel.findOne({ id }).exec();

    if (!res) return null;

    return res.postId;
  }

  public async likeComment(
    commentId: string,
    userId: string,
    postId: string,
  ): Promise<boolean> {
    try {
      await this.LikesCommentModel.findOneAndUpdate(
        { commentId, authorId: userId },
        {
          status: LikeCommentStatus.LIKE,
          postId,
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );
      return true;
    } catch (error) {
      console.error(`Error liking comment ${commentId}:`, error);
      return false;
    }
  }

  public async dislikeComment(
    commentId: string,
    userId: string,
    postId: string,
  ): Promise<boolean> {
    try {
      await this.LikesCommentModel.findOneAndUpdate(
        { commentId, authorId: userId },
        {
          status: LikeCommentStatus.DISLIKE,
          postId,
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );
      return true;
    } catch (error) {
      console.error(`Error disliking comment ${commentId}:`, error);
      return false;
    }
  }

  public async noneStatusComment(
    commentId: string,
    userId: string,
    postId: string,
  ): Promise<boolean> {
    try {
      await this.LikesCommentModel.findOneAndUpdate(
        {
          commentId,
          authorId: userId,
        },
        {
          status: LikeCommentStatus.NONE,
          postId,
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

      return true;
    } catch (error) {
      console.error(`Error none status comment ${commentId}:`, error);
      return false;
    }
  }
}
