import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infra/comments.repository';
import { CommentInputModel } from '../../api/models/input/comment.input.model';
import { HttpException, HttpStatus } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly body: CommentInputModel,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, body, userId } = command;

    const isOwn = await this.commentsRepository.checkIsOwn(commentId, userId);

    if (!isOwn) {
      throw new HttpException('auth', HttpStatus.UNAUTHORIZED);
    }

    const res = await this.commentsRepository.updateComment(
      commentId,
      body.content,
    );

    if (!res) {
      throw new HttpException('blog', HttpStatus.BAD_REQUEST);
    }
  }
}
