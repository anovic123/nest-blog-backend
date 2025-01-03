import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogInputModel } from '../../api/models/input/blog.input.model';
import { BlogViewModel } from '../../api/models/output';

import { BlogsRepository } from '../../infra/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public readonly body: BlogInputModel,
    public readonly id: BlogViewModel['id'],
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand) {
    const { body, id } = command;

    const res = await this.blogsRepository.updateBlog(body, id);

    if (!res) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return res;
  }
}
