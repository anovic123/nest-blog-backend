import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CommentsRepository } from '../infra/comments.repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  public async deleteComment(commentId: string, userId: string) {
    const isOwn = await this.commentsRepository.checkIsOwn(commentId, userId);

    if (!isOwn) {
      throw new HttpException('auth', HttpStatus.UNAUTHORIZED);
    }

    await this.commentsRepository.deleteComment(commentId);
  }
}
