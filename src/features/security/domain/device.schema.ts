import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDevicesDB = {
  user_id: string;
  devices_id: string;
  devices_name: string;
  ip: string;
  exp: string;
};

export type AuthDeviceDocument = HydratedDocument<AuthDevice>;

@Schema()
export class AuthDevice {
  @Prop({ type: String, required: true })
  user_id: string;
  @Prop({ type: String, required: true })
  devices_id: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  exp: string;
}

export const authDeviceSchema = SchemaFactory.createForClass(AuthDevice);
