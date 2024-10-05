import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infra/blogs.repository';
import { BlogsQueryRepository } from '../../infra/blogs-query.repository';

import { BlogPostInputModel } from '../../api/models/input/blog-post.input.model';

import { BlogPostViewModel } from '../../api/models/output';

export class CreatePostBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly body: BlogPostInputModel,
  ) {}
}

@CommandHandler(CreatePostBlogCommand)
export class CreatePostBlogUseCase
  implements ICommandHandler<CreatePostBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: CreatePostBlogCommand): Promise<BlogPostViewModel> {
    const { blogId, body } = command;

    const findBlog = await this.blogsQueryRepository.findBlog(blogId);
    if (!findBlog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
    return this.blogsRepository.createPostBlog(blogId, body)!;
  }
}
