import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuard } from 'src/core/guards/auth.guard';

import { CommentsQueryRepository } from '../infra/comments-query.repository';

import { CommentInputModel } from './models/input/comment.input.model';

import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { UpdateLikeCommentCommand } from '../application/use-cases/update-like-comment.use-case';

import { LikeStatusInputModel } from './models/input/likes.input.dto';

import { RequestWithUser } from '../../../../base/types/request';
import { Public } from '../../../../core/decorators/public.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(AuthGuard)
  @Put('/:commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: LikeStatusInputModel,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];

    return this.commandBus.execute(
      new UpdateLikeCommentCommand(user.userId, body.likeStatus, commentId),
    );
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:commentId')
  public async getCommentsById(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];
    const commentsRes = await this.commentsQueryRepository.getCommentById(
      id,
      user?.userId,
    );
    if (!commentsRes) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return commentsRes;
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCommentById(
    @Param('commentId') commentId: string,
    @Req() request: Request,
  ) {
    const user = request['user'];

    return this.commandBus.execute(
      new DeleteCommentCommand(commentId, user.userId),
    );
  }

  @UseGuards(AuthGuard)
  @Put('/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentById(
    @Param('commentId') commentId: string,
    @Body() body: CommentInputModel,
    @Req() request: Request,
  ) {
    const user = request['user'];

    return this.commandBus.execute(
      new UpdateCommentCommand(commentId, body, user.userId),
    );
  }
}
