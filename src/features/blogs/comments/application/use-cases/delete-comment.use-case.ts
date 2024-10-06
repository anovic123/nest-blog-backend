import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infra/comments.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command;

    const isExisted = await this.commentsRepository.isExistedComment(commentId);

    if (!isExisted) {
      throw new NotFoundException();
    }

    const isOwn = await this.commentsRepository.checkIsOwn(commentId, userId);

    if (!isOwn) {
      throw new HttpException('auth', HttpStatus.FORBIDDEN);
    }

    await this.commentsRepository.deleteComment(commentId);
  }
}
