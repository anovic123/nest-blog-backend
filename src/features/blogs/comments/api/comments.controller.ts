import { CommentsService } from './../application/comments.service';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthGuard } from 'src/core/guards/auth.guard';

import { CommentsQueryRepository } from '../infra/comments-query.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
  ) {}

  @Get('/:id')
  public async getCommentsById(@Param('id') id: string) {
    const commentsRes = await this.commentsQueryRepository.getCommentById(id);
    if (!commentsRes) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return commentsRes;
  }

  @UseGuards(AuthGuard)
  @Delete('/commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCommentById(
    @Param('commentId') commentId: string,
    @Req() request: Request,
  ) {
    const user = request['user'];

    return this.commentsService.deleteComment(commentId, user.userId);
  }

  // @UseGuards(AuthGuard)
  // @Put('/commentId')
  // @HttpCode(HttpStatus.NO_CONTENT)
}
