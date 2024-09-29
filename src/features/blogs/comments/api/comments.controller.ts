import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { CommentsQueryRepository } from '../infra/comments-query.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get('/:id')
  public async getCommentsById(@Param('id') id: string) {
    const commentsRes = await this.commentsQueryRepository.getCommentById(id);
    if (!commentsRes) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return commentsRes;
  }
}
