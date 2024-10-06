import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { BlogsRepository } from '../../features/blogs/blogs/infra/blogs.repository';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogRepository: BlogsRepository) {}
  async validate(value: any, args: ValidationArguments) {
    const blogIsExist = await this.blogRepository.blogIsExist(value);
    return blogIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `BlogId ${validationArguments?.value} is not exist`;
  }
}

export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}
