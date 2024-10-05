import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostInputModel } from '../../api/models/input/create-post.input.model';
import { PostViewModel } from '../../api/models/output';

import { BlogsRepository } from '../../../blogs/infra/blogs.repository';
import { PostsRepository } from '../../infra/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostByIdCommand {
  constructor(
    public readonly body: PostInputModel,
    public readonly id: PostViewModel['id'],
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase
  implements ICommandHandler<UpdatePostByIdCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostByIdCommand) {
    const { body, id } = command;

    const blog = await this.blogsRepository.findBlog(body.blogId);
    if (!blog) {
      throw new NotFoundException(`post with id ${id} not found`);
    }

    return await this.postsRepository.putPost(body, id, blog.name);
  }
}
