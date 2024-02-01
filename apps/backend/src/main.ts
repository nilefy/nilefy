import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  patchNestJsSwagger();
  app.use(morgan('dev'));
  app.useWebSocketAdapter(new WsAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('WEBLOOM')
    .setDescription('webloom api')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
