import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infra/comments.repository';
import { CommentsQueryRepository } from '../../infra/comments-query.repository';

import { LikeCommentStatus } from '../../api/models/output';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

export class UpdateLikeCommentCommand {
  constructor(
    public readonly userId: string,
    public readonly body: LikeCommentStatus,
    public readonly commentId: string,
  ) {}
}

@CommandHandler(UpdateLikeCommentCommand)
export class UpdateLikeCommentUseCase
  implements ICommandHandler<UpdateLikeCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(command: UpdateLikeCommentCommand) {
    const { userId, body, commentId } = command;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );

    const postId =
      await this.commentsRepository.getPostIdByCommentId(commentId);

    if (!comment || !postId) {
      throw new NotFoundException();
    }

    const likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: comment.likesInfo.myStatus,
    };

    switch (body) {
      case LikeCommentStatus.NONE:
        if (
          likesInfo?.myStatus === LikeCommentStatus.DISLIKE ||
          likesInfo?.myStatus === LikeCommentStatus.LIKE
        ) {
          await this.commentsRepository.noneStatusComment(
            commentId,
            userId,
            postId,
          );
        } else if (likesInfo?.myStatus === LikeCommentStatus.NONE) {
          await this.commentsRepository.likeComment(commentId, userId, postId);
        }

        break;
      case LikeCommentStatus.LIKE:
        await this.commentsRepository.likeComment(commentId, userId, postId);
        break;
      case LikeCommentStatus.DISLIKE:
        await this.commentsRepository.dislikeComment(commentId, userId, postId);
        break;
    }
  }
}
