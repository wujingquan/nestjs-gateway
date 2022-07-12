import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { generateDocument } from './doc';
import { FastifyLogger } from './common/logger';
import fastify, { FastifyInstance } from 'fastify';

declare const module: any;

async function bootstrap() {
  const fastifyInstance: FastifyInstance = fastify({
    logger: FastifyLogger,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
  );

  // 统一响应体格式
  app.useGlobalInterceptors(new TransformInterceptor());
  // 异常过滤器
  // 这里一定要注意引入自定义异常的先后顺序，不然异常捕获逻辑会出现混乱。
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // 启动全局字段校验，保证请求接口字段校验正确。
  app.useGlobalPipes(new ValidationPipe());

  // 创建文档
  generateDocument(app);

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
