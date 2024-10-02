import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from 'src/common/decorators';

export class BlogInputModel {
  @IsString()
  @Trim()
  @Length(0, 15)
  name: string;
  @IsString()
  @Trim()
  @Length(0, 500)
  description: string;
  @IsUrl()
  @Trim()
  @Length(0, 100)
  websiteUrl: string;
}
