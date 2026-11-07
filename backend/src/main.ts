import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load local environment variables when available
try {
  process.loadEnvFile();
} catch {
  // Render and container platforms provide environment variables directly
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configure allowed origins with production Vercel frontend, local dev, and custom env
  const defaultOrigins = [
    'https://pill-reminder-snowy.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOriginsSet = new Set([...defaultOrigins, ...envOrigins]);

  // 2. Enable robust CORS with origin validation function and OPTIONS preflight support
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g. mobile native apps, curl, health checks, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Check exact match in configured list OR any Vercel deployment URL
      if (
        allowedOriginsSet.has(normalizedOrigin) ||
        /^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      return callback(new Error(`CORS Error: Origin ${origin} not allowed by CORS policy`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-client-timestamp',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = Number(process.env.PORT) || 4000;

  // Render requires the application to listen on 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`PillReminder backend is running on port ${port}`);
}

await bootstrap();
