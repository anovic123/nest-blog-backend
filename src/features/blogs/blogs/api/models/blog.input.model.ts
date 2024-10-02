import { IsString, Length } from 'class-validator';
import { Trim } from 'src/common/decorators';

export class BlogInputModel {
  @IsString()
  @Trim()
  @Length(1, 15)
  name: string;
  @IsString()
  @Trim()
  @Length(1, 500)
  description: string;
  @IsString()
  @Trim()
  @Length(1, 100)
  websiteUrl: string;
}
