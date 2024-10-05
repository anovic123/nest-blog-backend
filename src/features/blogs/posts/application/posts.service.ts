import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { PostsRepository } from '../infra/posts.repository';
import { BlogsRepository } from '../../blogs/infra/blogs.repository';
import { UsersRepository } from 'src/features/users/infra/users.repository';

import { PostDocument } from '../domain/post.schema';
import { User } from 'src/features/users/domain/users.schema';
import { LikePostStatus } from '../domain/post-like.schema';

import { PostInputModel } from '../api/models/input/create-post.input.model';
import { PostViewModel } from '../api/models/output';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
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
    if (!createdPost) {
      throw new HttpException(
        'Error while creating post',
        HttpStatus.BAD_REQUEST,
      );
    }

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

  public async postLike(
    postId: PostViewModel['id'],
    userLikesStatus: LikePostStatus | undefined,
    bodyLikesStatus: LikePostStatus,
    userId: User['_id'],
  ) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('user', HttpStatus.NOT_FOUND);
    }

    const { login } = user.accountData;

    switch (bodyLikesStatus) {
      case LikePostStatus.NONE:
        await this.postsRepository.noneStatusPost(userId, postId, login);
        break;
      case LikePostStatus.LIKE:
        await this.postsRepository.likePost(userId, postId, login);
        break;
      case LikePostStatus.DISLIKE:
        await this.postsRepository.dislikePost(userId, postId, login);
        break;
      default:
        return false;
    }
  }
}
