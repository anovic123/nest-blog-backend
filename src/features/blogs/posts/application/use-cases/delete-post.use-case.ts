import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { PostsRepository } from '../../infra/posts.repository';

import { PostViewModel } from '../../api/models/output';

export class DeletePostCommand {
  constructor(public readonly id: PostViewModel['id']) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    const result = this.postsRepository.deletePost(command.id);

    if (!result) {
      throw new NotFoundException(`Blog with id ${command.id} not found`);
    }
  }
}
