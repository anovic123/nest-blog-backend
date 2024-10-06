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
import {
  LikePost,
  LikePostDocument,
} from '../../posts/domain/post-like.schema';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(LikePost.name) private LikePostModel: Model<LikePostDocument>,
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
    userId?: string | null | undefined,
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
        items.map((i: any) => this.mapPostOutput(i, userId)),
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

  public async mapPostOutput(
    post: PostDocument,
    userId?: string | null | undefined,
  ): Promise<PostViewModel> {
    const likes = await this.LikePostModel.find({
      postId: new Types.ObjectId(post._id).toString(),
    });

    const userLike = userId ? likes.find((l) => l.authorId === userId) : null;

    const likesCount =
      likes.filter((l) => l.status === LikePostStatus.LIKE).length ?? 0;
    const dislikesCount =
      likes.filter((l) => l.status === LikePostStatus.DISLIKE).length ?? 0;
    const myStatus = userLike?.status ?? LikePostStatus.NONE;

    const newestLikes = likes
      .filter((l) => l.status === LikePostStatus.LIKE)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3)
      .map((l) => ({
        addedAt: l.createdAt,
        userId: l.authorId,
        login: l.login,
      }));

    const postForOutput: PostViewModel = {
      id: new Types.ObjectId(post._id).toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: newestLikes.length > 0 ? newestLikes : [],
      },
    };

    return postForOutput;
  }
}
