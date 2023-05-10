import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(
  HttpException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  HttpExceptionFilter,
  ConflictException,
  BadRequestException,
)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse: any = exception.getResponse();
    const message = exceptionResponse.message
      ? exceptionResponse.message
      : exception.message;
    const options = exceptionResponse.options || {};
    const cause = options.cause;
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      message,
      cause,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
