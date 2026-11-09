import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

const GENERIC_ERROR = 'Ocurrió un error inesperado. Intentá de nuevo en un momento.';
const TOO_MANY_REQUESTS = 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = GENERIC_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const raw = (body as { message?: unknown }).message;
        if (Array.isArray(raw)) {
          message = raw.filter((item) => typeof item === 'string').join('. ') || exception.message;
        } else if (typeof raw === 'string') {
          message = raw;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
      if (status === HttpStatus.TOO_MANY_REQUESTS && /too many/i.test(message)) {
        message = TOO_MANY_REQUESTS;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.path} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.path} -> ${status}: ${message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}