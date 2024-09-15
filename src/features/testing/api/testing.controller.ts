import { Controller, Delete, HttpCode } from '@nestjs/common';

import { TestingService } from '../application/testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('/all-data')
  @HttpCode(204)
  public async deleteAll() {
    return this.testingService.deleteAll();
  }
}
