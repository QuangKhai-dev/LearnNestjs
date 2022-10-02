import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      //loại bỏ các thuộc tính không mong muốn
      whitelist: true,
    }),
  );
  await app.listen(3333);
}
bootstrap();
