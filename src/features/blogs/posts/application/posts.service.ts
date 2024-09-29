import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { PostsRepository } from '../infra/posts.repository';
import { BlogsRepository } from '../../blogs/infra/blogs.repository';

import { PostDocument } from '../domain/post.schema';

import { PostInputModel, PostViewModel } from '../dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  public async createPost(post: PostInputModel): Promise<PostViewModel | null> {
    const blog = await this.blogsRepository.findBlog(post.blogId);

    if (!blog) return null;

    const newPost = {
      _id: new Types.ObjectId(),
      title: post.title,
      content: post.content,
      shortDescription: post.shortDescription,
      blogId: post.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      isMembership: false,
    } as PostDocument;

    const createdPost = await this.postsRepository.createPost(newPost);
    if (!createdPost) return null;

    return this.postsRepository.mapPostOutput(newPost);
  }

  public async putPostById(
    body: PostInputModel,
    id: PostViewModel['id'],
  ): Promise<boolean> {
    const blog = await this.blogsRepository.findBlog(body.blogId);
    if (!blog) return false;

    return await this.postsRepository.putPost(body, id, blog.name);
  }

  public async deletePost(id: PostViewModel['id']): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }
}
