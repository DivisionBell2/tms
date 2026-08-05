import { ArgumentsHost, Catch, type RpcExceptionFilter } from "@nestjs/common";
import { RpcErrorDto } from "@tms/contracts";
import { Observable, throwError } from "rxjs";

type HttpExceptionLike = {
    getStatus: () => number;
    getResponse: () => unknown;
    message: string;
};

function isHttpExceptionLike(exception: unknown): exception is HttpExceptionLike {
    return (
        !!exception &&
        typeof exception === 'object' &&
        typeof (exception as HttpExceptionLike).getStatus === 'function' &&
        typeof (exception as HttpExceptionLike).getResponse === 'function'
    );
}

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
    catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
        // Duck-typing: в monorepo могут быть несколько копий @nestjs/common,
        // из-за чего `instanceof HttpException` ломается.
        if (isHttpExceptionLike(exception)) {
            const res = exception.getResponse();
            const message =
                typeof res === 'string'
                    ? res
                    : ((res as { message?: string | string[] }).message ?? exception.message);
            const error: RpcErrorDto = {
                statusCode: exception.getStatus(),
                message
            };

            return throwError(() => error);
        }

        const fallback: RpcErrorDto = { statusCode: 500, message: 'Internal server error' };

        return throwError(() => fallback);
    }
}
