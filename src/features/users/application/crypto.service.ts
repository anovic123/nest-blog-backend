import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor() {}

  async generateSalt() {
    return bcrypt.genSalt(10);
  }
  async generateHash(password: string, salt: number) {
    return bcrypt.hash(password, salt);
  }
  async compareHash(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
}
