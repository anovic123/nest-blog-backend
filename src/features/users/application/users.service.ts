import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../infra/users.repository';

import { CryptoService } from 'src/core/application/crypto-service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  public async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
}
