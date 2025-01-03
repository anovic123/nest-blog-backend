import { IsEnum, IsString } from 'class-validator';
import { LikePostStatus } from '../../../domain/post-like.schema';
import { Trim } from 'src/core/decorators';

export class LikePostInputModel {
  @IsString()
  @Trim()
  @IsEnum(LikePostStatus)
  likeStatus: LikePostStatus;
}
