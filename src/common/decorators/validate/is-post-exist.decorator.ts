import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from 'src/features/blogs/posts/infra/posts.repository';

@Injectable()
export class IsPostExistPipe implements PipeTransform {
  constructor(private readonly postsRepository: PostsRepository) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const isPostExisted = await this.postsRepository.isPostExisted(value);

    if (!isPostExisted) {
      throw new NotFoundException(`Post with ID ${value} does not exist`);
    }

    return value;
  }
}
