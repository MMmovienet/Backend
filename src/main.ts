import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
      new ValidationPipe({
          exceptionFactory: (errors) => {
              const result = errors.map((error) => {
                return error.constraints![Object.keys(error.constraints!)[0]];
              });
              return new UnprocessableEntityException(result);
          },
          stopAtFirstError: true,
      }),
      new ValidationPipe({
          whitelist: true
      })
  );
  useContainer(app.select(AppModule), {fallbackOnErrors: true});
  const configService = app.get(ConfigService);
  app.use('/uploads', express.static(join(process.cwd(), 'uploads'))); 
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
