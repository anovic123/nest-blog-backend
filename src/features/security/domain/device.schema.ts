import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class AuthDevicesDB {
  user_id: string;
  device_id: string;
  iat: string;
  ip: string;
  exp: string;
  device_name: string;
}

export type AuthDeviceDocument = HydratedDocument<AuthDevice>;

@Schema()
export class AuthDevice {
  @Prop({ type: String, required: true })
  user_id: string;
  @Prop({ type: String, required: true })
  device_id: string;
  @Prop({ required: true })
  iat: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  exp: string;
  @Prop({ type: String, required: true })
  device_name: string;
}

export const authDeviceSchema = SchemaFactory.createForClass(AuthDevice);
