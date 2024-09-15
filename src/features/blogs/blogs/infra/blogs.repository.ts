import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Blog, BlogsDocument } from '../domain/blogs.schema';

import { BlogInputModel, BlogViewModel } from '../dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
  ) {}

  public async createBlog(blog: BlogsDocument): Promise<BlogViewModel> {
    try {
      const result = await this.BlogModel.create(blog);

      if (!result) {
        throw new Error('Error while creating blog');
      }

      return this.mapBlog(result);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async updateBlog(
    blog: BlogInputModel,
    id: BlogViewModel['id'],
  ): Promise<boolean> {
    try {
      const result = await this.BlogModel.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async deleteBlog(id: BlogViewModel['id']): Promise<boolean> {
    try {
      const result = await this.BlogModel.deleteOne({
        _id: new Types.ObjectId(id),
      });
      return result.deletedCount === 1;
    } catch (error) {
      throw new Error(error);
    }
  }

  public mapBlog(blog: BlogsDocument): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
