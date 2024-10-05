import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogViewModel } from '../../api/models/output';

import { BlogsRepository } from '../../infra/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public readonly id: BlogViewModel['id']) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    const { id } = command;

    const res = this.blogsRepository.deleteBlog(id);

    if (!res) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
