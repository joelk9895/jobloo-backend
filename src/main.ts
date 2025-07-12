import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default, or specify a specific origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use DocumentBuilder to create the Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Jobloo API')
    .setDescription('API documentation for Jobloo application')
    .setVersion('1.0')
    .addBearerAuth() // This is important for testing protected endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  console.log(`Server running on port ${port}`);
  await app.listen(port);
}
export async function createNestServer() {
  const app = await NestFactory.create(AppModule);
  return app;
}

void bootstrap();
