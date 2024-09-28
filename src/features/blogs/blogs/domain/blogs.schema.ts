import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogsDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({
    required: true,
    type: String,
  })
  name: string;
  @Prop({
    required: true,
    type: String,
  })
  description: string;
  @Prop({
    required: true,
    type: String,
  })
  websiteUrl: string;
  @Prop({
    required: true,
    type: String,
  })
  createdAt: string;
  @Prop({
    required: true,
    type: Boolean,
  })
  isMembership: boolean;
}

export const blogSchema = SchemaFactory.createForClass(Blog);
