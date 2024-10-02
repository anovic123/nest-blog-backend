import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Blog, BlogsDocument } from '../domain/blogs.schema';
import { Post, PostDocument } from '../../posts/domain/post.schema';

import { BlogInputModel } from '../api/models/input/blog.input.model';

import { LikePostStatus } from '../../posts/dto';
import { BlogPostViewModel, BlogViewModel } from '../api/models/output';
import { BlogPostInputModel } from '../api/models/input/blog-post.input.model';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
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

  public async createPostBlog(
    blogId: BlogViewModel['id'],
    post: BlogPostInputModel,
  ): Promise<BlogPostViewModel | null> {
    try {
      const blog = await this.findBlog(blogId);
      if (!blog) {
        return null;
      }

      const newPost = {
        _id: new Types.ObjectId(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: new Date().toISOString(),
      } as PostDocument;

      await this.PostModel.create(newPost);

      return this.mapNewPostBlog(newPost);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  public mapNewPostBlog(post: PostDocument): BlogPostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: [],
      },
    };
  }
}
