import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Blog, BlogsDocument } from '../domain/blogs.schema';
import { Post, PostDocument } from '../../posts/domain/post.schema';

import {
  BlogPostViewModel,
  BlogViewModel,
  LikePostStatus,
} from '../api/models/output';

import {
  getAllBlogsHelper,
  GetAllBlogsHelperResult,
  getBlogPostsHelper,
  GetBlogPostsHelperResult,
} from '../helper';

import { PaginatedResponse } from '../../../../base/types/pagination';
import { PostViewModel } from '../../posts/api/models/output';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
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

    const sortBy = sanitizedQuery.sortBy || 'createdAt';

    try {
      const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
      const items: BlogsDocument[] = await this.BlogModel.find(filter)
        .sort({
          [sortBy]: sortDirection,
        })
        .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize);

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

  public async getBlogPosts(
    query: GetBlogPostsHelperResult,
    blogId: string,
  ): Promise<PaginatedResponse<BlogPostViewModel>> {
    const sanitizedQuery = getBlogPostsHelper(
      query as { [key: string]: string | undefined },
    );

    const byId = blogId ? { blogId: new Types.ObjectId(blogId) } : {};

    const filter: any = {
      ...byId,
    };

    const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
    const sortBy = sanitizedQuery.sortBy || 'createdAt';

    try {
      const items = await this.PostModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize)
        .exec();

      const totalCount = await this.PostModel.countDocuments(filter);

      const mappedItems = await Promise.all(
        items.map((i: any) => this.mapPostOutput(i)),
      );

      return {
        pagesCount: Math.ceil(totalCount / (query.pageSize ?? 10)),
        page: sanitizedQuery.pageNumber,
        pageSize: sanitizedQuery.pageSize,
        totalCount,
        items: mappedItems,
      };
    } catch (error) {
      console.log(error);
      return {
        pagesCount: 0,
        page: sanitizedQuery.pageNumber,
        pageSize: sanitizedQuery.pageSize,
        totalCount: 0,
        items: [],
      };
    }
  }

  public async mapPostOutput(post: PostDocument): Promise<PostViewModel> {
    const postForOutput: PostViewModel = {
      id: new Types.ObjectId(post._id).toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: [],
      },
    };

    return postForOutput;
  }
}
