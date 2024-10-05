import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PostsRepository } from '../infra/posts.repository';
import { BlogsRepository } from '../../blogs/infra/blogs.repository';
import { UsersRepository } from 'src/features/users/infra/users.repository';

import { User } from 'src/features/users/domain/users.schema';
import { LikePostStatus } from '../domain/post-like.schema';

import { PostViewModel } from '../api/models/output';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
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
