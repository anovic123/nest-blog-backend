/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';

import { HttpExceptionFilter } from 'src/common/exception-filters/http-exception-filter';
import configuration from './configuration';

// const APP_PREFIX = '/api'

export const applyAppSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // setAppPrefix(app);
  setAppPipes(app);

  setAppExceptionsFilters(app);

  app.use(cookieParser());
};

// const setAppPrefix = (app: INestApplication) => {
//   // Устанавливается для разворачивания front-end и back-end на одном домене
//   // https://site.com - front-end
//   // https://site.com/api - backend-end
//   app.setGlobalPrefix(APP_PREFIX);
// };

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = [];

        console.log(errors);

        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints as any);

          console.log(e.constraints);

          constraintKeys.forEach((cKey, index) => {
            if (index >= 1) return;
            const msg = e.constraints?.[cKey] as any;

            // @ts-ignore
            customErrors.push({ key: e.property, message: msg });
          });
        });

        // Error 400
        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
