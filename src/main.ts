import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

import { applyAppSettings } from './settings/apply-app-setting';
import { ConfigurationType } from './settings/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiSettings = configService.get('apiSettings', { infer: true });
  const environmentSettings = configService.get('environmentSettings', {
    infer: true,
  });

  const port = apiSettings.PORT;
  console.log('🚀 ~ bootstrap ~ port:', port);

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('ENV', environmentSettings.currentEnv);
  });
}

bootstrap();
