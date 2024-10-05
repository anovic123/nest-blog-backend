import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';

import { PostInputModel } from '../../api/models/input/create-post.input.model';

import { BlogsRepository } from '../../../blogs/infra/blogs.repository';
import { PostsRepository } from '../../infra/posts.repository';

import { PostDocument } from '../../domain/post.schema';

export class CreatePostCommand {
  constructor(public readonly body: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepository.findBlog(command.body.blogId);

    if (!blog)
      return new HttpException('blog is incorrect', HttpStatus.BAD_REQUEST);

    const newPost = {
      _id: new Types.ObjectId(),
      title: command.body.title,
      content: command.body.content,
      shortDescription: command.body.shortDescription,
      blogId: command.body.blogId,
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
}
