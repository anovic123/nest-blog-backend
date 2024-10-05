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
    @Param('postId', IsPostExistPipe) postId: string,
    @Body() body: LikePostInputModel,
    @Req() request: Request,
  ) {
    const user = request['user'];
    const post = await this.postQueryRepository.findPostsAndMap(
      postId,
      user.userId,
    );
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

  @UseGuards(RefreshTokenGuard)
  @Get()
  public async getPosts(
    @Query() query: { [key: string]: string | undefined },
    @Req() request: any,
  ) {
    return this.postQueryRepository.getAllPosts(query, request.userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/:id')
  public async getPostsById(@Param('id') id: string, @Req() request: any) {
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    const post = await this.postQueryRepository.findPostsAndMap(
      id,
      request.userId,
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
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Get('/:id/comments')
  public async getPostsComments(
    @Param('postId') postId: string,
    @Query() query: { [key: string]: string | undefined },
  ) {
    if (!postId) {
      throw new NotFoundException(`Blog id is required`);
    }
    const result = await this.postQueryRepository.getPostsComments(
      query,
      postId,
    );

    if (!result || result.items.length === 0) {
      throw new NotFoundException(`Comments with post id ${postId} not found`);
    }

    return result;
  }
}
