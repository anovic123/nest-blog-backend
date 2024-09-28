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
} from '@nestjs/common';

import { PostsService } from '../application/posts.service';

import { PostsQueryRepository } from '../infra/posts-query-repository';

import { PostInputModel } from '../dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  public async createPost(@Body() body: PostInputModel) {
    const newPost = await this.postsService.createPost(body);

    if (!newPost) {
      throw new HttpException(
        'Error while creating post',
        HttpStatus.BAD_REQUEST,
      );
    }

    return newPost;
  }

  @Get()
  public async getPosts(@Query() query: { [key: string]: string | undefined }) {
    return this.postQueryRepository.getAllPosts(query);
  }

  @Get('/:id')
  public async getPostsById(@Param('id') id: string) {
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    const post = await this.postQueryRepository.findPostsAndMap(id);

    if (!post) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return post;
  }

  @Put('/:id')
  @HttpCode(204)
  public async putPost(@Body() body: PostInputModel, @Param('id') id: string) {
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    const result = await this.postsService.putPostById(body, id);

    if (!result) {
      throw new NotFoundException(`post with id ${id} not found`);
    }

    return;
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string) {
    if (!id) {
      throw new NotFoundException(`Blog id is required`);
    }
    const result = await this.postsService.deletePost(id);

    if (!result) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return;
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
