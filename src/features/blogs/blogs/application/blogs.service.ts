import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { BlogsRepository } from '../infra/blogs.repository';

import { BlogsDocument } from '../domain/blogs.schema';

import { BlogInputModel, BlogViewModel } from '../dto';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

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
}
