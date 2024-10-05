import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { BlogInputModel } from '../../api/models/input/blog.input.model';
import { BlogViewModel } from '../../api/models/output';

import { BlogsRepository } from '../../infra/blogs.repository';

import { BlogsDocument } from '../../domain/blogs.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(public readonly body: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel> {
    const { body } = command;
    const newBlog = {
      _id: new Types.ObjectId(),
      name: body.name,
      description: body.description,
      websiteUrl: body.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    } as BlogsDocument;

    const createdResult = await this.blogsRepository.createBlog(newBlog);

    if (!createdResult) {
      throw new HttpException(
        'Error while creating blog',
        HttpStatus.BAD_REQUEST,
      );
    }

    return createdResult;
  }
}
