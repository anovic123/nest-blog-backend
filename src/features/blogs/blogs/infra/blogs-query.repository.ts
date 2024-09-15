import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Blog, BlogsDocument } from '../domain/blogs.schema';

import { getAllBlogsHelper, GetAllBlogsHelperResult } from '../helper';

import { BlogViewModel } from '../dto';

import { PaginatedResponse } from '../../../../types';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
  ) {}

  public async getAllBlogs(
    query: GetAllBlogsHelperResult,
    blogId?: BlogViewModel['id'],
  ): Promise<PaginatedResponse<BlogViewModel>> {
    const sanitizedQuery = getAllBlogsHelper(
      query as { [key: string]: string | undefined },
    );

    const byId = blogId ? { blogId: new Types.ObjectId(blogId) } : {};
    const search = sanitizedQuery.searchNameTerm
      ? { name: { $regex: sanitizedQuery.searchNameTerm, $options: 'i' } }
      : {};

    const filter = {
      ...byId,
      ...search,
    };

    try {
      const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
      const items: BlogsDocument[] = await this.BlogModel.find(filter)
        .sort(sanitizedQuery.sortBy, {
          [sanitizedQuery.sortDirection]: sortDirection,
        })
        .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize)
        .exec();

      const totalCount = await this.BlogModel.countDocuments(filter);

      return {
        pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
        page: sanitizedQuery.pageNumber,
        pageSize: sanitizedQuery.pageSize,
        totalCount,
        items: items.map((b: BlogsDocument) => this.mapBlog(b)),
      };
    } catch (error) {
      console.error(error);
      return {
        pagesCount: 0,
        page: 0,
        pageSize: 0,
        totalCount: 0,
        items: [],
      };
    }
  }

  public async findBlog(
    id: BlogViewModel['id'],
  ): Promise<BlogViewModel | null> {
    try {
      const res = await this.BlogModel.findOne({
        _id: new Types.ObjectId(id),
      });

      if (!res) return null;
      return this.mapBlog(res);
    } catch (error) {
      throw new Error(error);
    }
  }

  protected mapBlog(blog: BlogsDocument): BlogViewModel {
    const blogForOutput: BlogViewModel = {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };

    return blogForOutput;
  }
}
