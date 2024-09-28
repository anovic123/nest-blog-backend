import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Comments, CommentsDocument } from '../domain/comments.schema';

import { CommentDBType, CommentViewModel, LikeCommentStatus } from '../dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
  ) {}

  async getCommentById(
    id: CommentViewModel['id'],
  ): Promise<CommentViewModel | null> {
    try {
      const comment = await this.CommentsModel.findOne({ id });

      if (!comment) return null;

      return this.mapPostCommentsOutput(comment);
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw new Error('Failed to fetch comment.');
    }
  }

  public mapPostCommentsOutput(comment: CommentDBType): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeCommentStatus.NONE,
      },
    };
  }
}
