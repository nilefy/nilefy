import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  patchNestJsSwagger();
  app.setGlobalPrefix('api');
  app.use(morgan('dev')); // doesn't this need to be deduced from the .env
  app.useWebSocketAdapter(new WsAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('Nilefy')
    .setDescription('Nilefy API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
