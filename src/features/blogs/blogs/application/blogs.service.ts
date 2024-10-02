import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { BlogsQueryRepository } from '../infra/blogs-query.repository';

import { BlogsRepository } from '../infra/blogs.repository';

import { BlogsDocument } from '../domain/blogs.schema';

import { BlogInputModel } from '../api/models/blog.input.model';

import { BlogPostInputModel, BlogViewModel } from '../dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  public async createBlog(body: BlogInputModel) {
    const newBlog = {
      _id: new Types.ObjectId(),
      name: body.name,
      description: body.description,
      websiteUrl: body.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    } as BlogsDocument;

    const createdResult = await this.blogsRepository.createBlog(newBlog);

    return createdResult;
  }

  public async updateBlog(
    blog: BlogInputModel,
    id: BlogViewModel['id'],
  ): Promise<boolean> {
    return await this.blogsRepository.updateBlog(blog, id);
  }

  public async deleteBlog(id: BlogViewModel['id']): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id);
  }

  public async createPostBlog(
    blogId: string,
    body: BlogPostInputModel,
  ): Promise<BlogPostInputModel | null> {
    try {
      const findBlog = await this.blogsQueryRepository.findBlog(blogId);
      if (!findBlog) {
        return null;
      }

      return this.blogsRepository.createPostBlog(blogId, body);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
