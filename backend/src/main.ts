import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load local environment variables when available
try {
  process.loadEnvFile();
} catch {
  // Render provides environment variables directly
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the configured frontend
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 4000;

  // Render requires the application to listen on 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`PillReminder backend is running on port ${port}`);
}

await bootstrap();