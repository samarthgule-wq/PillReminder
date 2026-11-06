import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load environment variables from .env
try {
  process.loadEnvFile();
} catch {
  // Fallback if .env does not exist or environment is already populated
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend applications
  app.enableCors({
    origin: true, // Allow all origins in local development (or explicitly http://localhost:3000)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port);
  console.log(`PillReminder backend is running at http://localhost:${port}`);
}

await bootstrap();
