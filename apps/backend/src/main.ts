import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/AllExceptionsFilter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const { httpAdapter } = app.get(HttpAdapterHost);
  patchNestJsSwagger();
  app.setGlobalPrefix('api');
  app.use(morgan('dev'));
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useWebSocketAdapter(new WsAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('NILEFY')
    .setDescription('nilefy api')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.use(cookieParser());
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
