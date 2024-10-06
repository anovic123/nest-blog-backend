import { IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';
import { BlogIsExist } from '../../../../../../core/pipes/is-blog-exist.pipe';

export class PostInputModel {
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string;
  @IsString()
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
  @IsString()
  @Trim()
  @BlogIsExist()
  blogId: string;
}
