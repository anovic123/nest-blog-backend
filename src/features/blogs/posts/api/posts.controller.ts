import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { BasicAuthGuard } from 'src/core/guards/auth-basic.guard';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { RefreshTokenGuard } from 'src/core/guards/refresh-token.guard';

import { IsPostExistPipe } from 'src/core/decorators/validate/is-post-exist.decorator';

import { PostsService } from '../application/posts.service';

import { PostsQueryRepository } from '../infra/posts-query-repository';

import { LikePostInputModel } from './models/input/like-post.input.model';
import { PostInputModel } from './models/input/create-post.input.model';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import {
  UpdatePostByIdCommand,
  UpdatePostByIdUseCase,
} from '../application/use-cases/update-post-by-id.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { Public } from '../../../../core/decorators/public.decorator';
import { RequestWithUser } from '../../../../base/types/request';
import { CommentInputModel } from '../../comments/api/models/input/comment.input.model';
import { CreatePostCommentCommand } from '../application/use-cases/create-post-comment.';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  // like posts
  @UseGuards(AuthGuard)
  @Put('/:postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async likePost(
    @Param('postId') postId: string,
    @Body() body: LikePostInputModel,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];
    const post = await this.postQueryRepository.findPostsAndMap(
      postId,
      user?.userId,
    );

    if (!post) {
      throw new NotFoundException();
    }

    return this.postsService.postLike(
      postId,
      post?.extendedLikesInfo.myStatus,
      body.likeStatus,
      user.userId,
    );
  }

  // create new post
  @UseGuards(BasicAuthGuard)
  @Post()
  public async createPost(@Body() body: PostInputModel) {
    return this.commandBus.execute(new CreatePostCommand(body));
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get()
  public async getPosts(
    @Query() query: { [key: string]: string | undefined },
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];
    return this.postQueryRepository.getAllPosts(query, user?.userId);
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:id')
  public async getPostsById(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    const post = await this.postQueryRepository.findPostsAndMap(
      id,
      user?.userId,
    );

    if (!post) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return post;
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async putPost(@Body() body: PostInputModel, @Param('id') id: string) {
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }

    return this.commandBus.execute(new UpdatePostByIdCommand(body, id));
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:id/comments')
  public async getPostsComments(
    @Param('postId') postId: string,
    @Query() query: { [key: string]: string | undefined },
    @Req() request: RequestWithUser,
  ) {
    if (!postId) {
      throw new NotFoundException(`Blog id is required`);
    }

    const user = request['user'];

    const result = await this.postQueryRepository.getPostsComments(
      query,
      postId,
      user?.userId,
    );

    if (!result || result.items.length === 0) {
      throw new NotFoundException(`Comments with post id ${postId} not found`);
    }

    return result;
  }

  @UseGuards(AuthGuard)
  @Post('/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  public async createPostComment(
    @Param('postId') postId: string,
    @Body() body: CommentInputModel,
    @Req() request: RequestWithUser,
  ) {
    if (!postId) {
      throw new NotFoundException(`post id is required`);
    }

    const user = request['user'];
    return this.commandBus.execute(
      new CreatePostCommentCommand(postId, body.content, user?.userId),
    );
  }
}
