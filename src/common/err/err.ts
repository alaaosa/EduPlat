import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class DomainErrorFilter implements ExceptionFilter{
    catch(exception: Error, host: ArgumentsHost) {

        const res = host.switchToHttp().getResponse()

    }
    
}