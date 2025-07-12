// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config();

export async function createNestServer() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Jobloo API')
    .setDescription('API documentation for Jobloo application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  return app;
}

// Local run only
if (process.env.NODE_ENV !== 'production') {
  createNestServer().then((app) => {
    const port = process.env.PORT || 3000;
    app.listen(port).then(() => {
      console.log(`🚀 Local server running on http://localhost:${port}`);
    });
  });
}
