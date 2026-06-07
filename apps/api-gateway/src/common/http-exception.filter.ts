import type { ArgumentsHost} from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { ExceptionFilter } from "@nestjs/common";
import { Catch } from "@nestjs/common";
import { type Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            res.status(status).json(
                typeof body === 'string' ? { statusCode: status, message: body } : body
            );

            return;
        }

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: 500,
            message: 'Internal server error'
        })
    }
}