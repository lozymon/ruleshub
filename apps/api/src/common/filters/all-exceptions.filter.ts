import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

// Global exception filter. NestJS's default behaviour leaks raw error
// payloads (most damagingly: Prisma errors quoting the failing column,
// or unhandled errors revealing stack traces) through to 5xx responses.
// This filter normalises everything to a small, stable shape and pushes
// the real exception into the server logs.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      res
        .status(status)
        .json(
          typeof payload === "object" && payload !== null
            ? payload
            : { statusCode: status, message: String(payload) },
        );
      return;
    }

    // Known Prisma client errors get mapped to sensible HTTP codes
    // without echoing the failing field/column name to the client.
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = mapPrismaError(exception);
      this.logger.warn(
        `Prisma ${exception.code} on ${ctx.getRequest<{ method?: string; url?: string }>().method ?? "?"} ` +
          `${ctx.getRequest<{ url?: string }>().url ?? "?"}: ${exception.message}`,
      );
      res.status(status).json({ statusCode: status, message });
      return;
    }

    if (
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      this.logger.error(`Prisma error: ${exception.message}`, exception.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
      return;
    }

    // Everything else — log full detail server-side, return a generic
    // 500 to the client so internal state doesn't leak.
    const err =
      exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(`Unhandled exception: ${err.message}`, err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}

function mapPrismaError(e: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
} {
  switch (e.code) {
    case "P2002":
      return {
        status: HttpStatus.CONFLICT,
        message: "Resource already exists",
      };
    case "P2025":
      return { status: HttpStatus.NOT_FOUND, message: "Resource not found" };
    case "P2003":
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid relation",
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      };
  }
}
