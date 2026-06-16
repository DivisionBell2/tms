import { ArgumentsHost, Catch, HttpException, RpcExceptionFilter } from "@nestjs/common";
import { RpcErrorDto } from "@tms/contracts";
import { Observable, throwError } from "rxjs";

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
    catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            const message = typeof res === 'string' ? res : ((res as { message?: string | string[] }).message ?? exception.message);
            const error: RpcErrorDto = {
                statusCode: exception.getStatus(),
                message
            }

            return throwError(() => error);
        }

        const fallback: RpcErrorDto = { statusCode: 500, message: 'Internal server error' };

        return throwError(() => fallback);
    }
}