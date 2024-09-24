import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes();
  await app.listen(PORT, () => {
    console.log('App starting listen port: ', PORT);
  });
}

bootstrap();
