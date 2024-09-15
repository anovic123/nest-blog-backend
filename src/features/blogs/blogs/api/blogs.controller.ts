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

import { BlogsQueryRepository } from '../infra/blogs-query.repository';

import { BlogsService } from '../application/blogs.service';

import { BlogInputModel, BlogPostInputModel } from '../dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Post()
  public async createBlog(@Body() body: BlogInputModel) {
    const newBlog = this.blogsService.createBlog(body);

    if (!newBlog) {
      throw new HttpException(
        'Error while creating blog',
        HttpStatus.BAD_REQUEST,
      );
    }

    return newBlog;
  }

  @Get()
  public async getBlogs(@Query() query: { [key: string]: string | undefined }) {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @Get('/:id')
  public async getBlogsById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlog(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }

  @Put('/:id')
  @HttpCode(204)
  public async putBlogs(@Body() body: BlogInputModel, @Param('id') id: string) {
    const updatedBlog = await this.blogsService.updateBlog(body, id);

    if (!updatedBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return updatedBlog;
  }

  @Delete('/:id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string) {
    const result = await this.blogsService.deleteBlog(id);

    if (!result) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return;
  }

  @Get('/:blogId/posts')
  public async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() query: { [key: string]: string | undefined },
  ) {
    const blogPostsResults = await this.blogsQueryRepository.getBlogPosts(
      query,
      blogId,
    );

    if (!blogPostsResults || blogPostsResults.items.length === 0) {
      throw new NotFoundException(`Blog posts with id ${blogId} not found`);
    }

    return blogPostsResults;
  }

  @Post('/:blogId/posts')
  public async createBlogsPost(
    @Param('blogId') blogId: string,
    @Body() body: BlogPostInputModel,
  ) {
    const newBlogPost = await this.blogsService.createPostBlog(blogId, body);

    if (!newBlogPost) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    return newBlogPost;
  }
}
