import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infra/posts-query-repository';
import { PostsRepository } from '../../infra/posts.repository';
import { Types } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../../../users/infra/users.repository';
import { LikeCommentStatus } from '../../../comments/api/models/output';

export class CreatePostCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly content: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase
  implements ICommandHandler<CreatePostCommentCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    const { postId, content, userId } = command;
    const postsId = new Types.ObjectId(postId);

    if (!Types.ObjectId.isValid(postsId)) {
      throw new HttpException('post', HttpStatus.BAD_REQUEST);
    }

    const existedPost = await this.postsQueryRepository.findPostsAndMap(postId);
    const user = await this.usersRepository.findUserById(
      new Types.ObjectId(userId),
    );

    if (!user) {
      return new UnauthorizedException();
    }

    if (!existedPost) {
      return new HttpException('post', HttpStatus.NOT_FOUND);
    }

    const newComment = {
      id: new Types.ObjectId().toString(),
      content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        userId: new Types.ObjectId(user._id).toString(),
        userLogin: user.accountData.login,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeCommentStatus.NONE,
      },
      postId,
    };

    const res = await this.postsRepository.createPostComment(newComment);
    return newComment;
  }
}
