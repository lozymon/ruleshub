import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

function resolveAppUrl(): string {
  const url = process.env.APP_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "APP_URL is not set. In production this must point at the web app's public origin.",
    );
  }
  Logger.warn(
    "APP_URL not set — falling back to http://localhost:3000 (dev/test only)",
    "Bootstrap",
  );
  return "http://localhost:3000";
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Trust the reverse proxy (Cloudflare / nginx / etc.) so req.protocol
  // and req.hostname reflect the public-facing values. Required for
  // building absolute URLs in responses (e.g. the package download
  // endpoint) without hardcoding a host in env config.
  app.set("trust proxy", true);

  // Standard hardening headers (HSTS, X-Content-Type-Options, X-Frame-Options,
  // etc). CSP is disabled because the only HTML this app serves is the
  // Swagger UI at /docs, which relies on inline scripts; the API itself is
  // JSON-only.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.enableCors({
    origin: resolveAppUrl(),
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix("v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("RulesHub API")
    .setDescription("Provider-agnostic marketplace for AI coding tool assets")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
