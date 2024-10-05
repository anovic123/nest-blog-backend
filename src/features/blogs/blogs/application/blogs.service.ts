import { Injectable } from '@nestjs/common';

import { BlogsQueryRepository } from '../infra/blogs-query.repository';

import { BlogsRepository } from '../infra/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
}
