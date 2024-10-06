import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Comments,
  CommentsDocument,
  LikeCommentDBType,
  LikesComment,
} from '../domain/comments.schema';

import {
  CommentDBType,
  CommentViewModel,
  LikeCommentStatus,
} from '../api/models/output';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
    @InjectModel(LikesComment.name)
    private LikesCommentModel: Model<LikesComment>,
  ) {}

  async getCommentById(
    id: CommentViewModel['id'],
    userId?: string | null | undefined,
  ): Promise<CommentViewModel | null> {
    try {
      const comment = await this.CommentsModel.findOne({ id });

      if (!comment) return null;

      const likes = (await this.LikesCommentModel.find({
        commentId: id,
      })) as unknown as LikeCommentDBType[];
      const userLike = userId
        ? likes.find((like) => like.authorId === userId)
        : null;

      return this.mapPostCommentsOutput(comment, likes, userLike);
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw new Error('Failed to fetch comment.');
    }
  }

  public mapPostCommentsOutput(
    comment: CommentDBType,
    likes: LikeCommentDBType[] = [],
    userLike: LikeCommentDBType | null = null,
  ): CommentViewModel {
    const likesCount =
      likes.filter((l) => l.status === LikeCommentStatus.LIKE).length ?? 0;
    const dislikesCount =
      likes.filter((l) => l.status === LikeCommentStatus.DISLIKE).length ?? 0;
    const myStatus = userLike?.status ?? LikeCommentStatus.NONE;

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
  }
}
