import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

import { applyAppSettings } from './settings/apply-app-setting';
import { ConfigurationType } from './settings/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  applyAppSettings(app);

  const configService = app.get(ConfigService<ConfigurationType, true>);
  console.log(configService);
  const apiSettings = configService.get('apiSettings', { infer: true });
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });

  const port = apiSettings.PORT;

  await app.listen(port, () => {
    console.log('PORT:', port);
    console.log('ENV:', environmentSettings.currentEnv);
  });
}

bootstrap();
