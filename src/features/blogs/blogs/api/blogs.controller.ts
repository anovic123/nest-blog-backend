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
  Query,
} from '@nestjs/common';

import { BlogsQueryRepository } from '../infra/blogs-query.repository';

import { BlogsService } from '../application/blogs.service';

import { getAllBlogsHelper, GetAllBlogsHelperResult } from './../helper';

import { BlogInputModel } from '../dto';

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
    const sanitizedQuery = getAllBlogsHelper(query) as GetAllBlogsHelperResult;

    return this.blogsQueryRepository.getAllBlogs(sanitizedQuery);
  }

  @Get('/:id')
  public async getBlogsById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlog(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }

  @Get('/:id')
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
}
