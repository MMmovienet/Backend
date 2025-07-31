import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UseInterceptors } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



interface ClassConstructor {
  new (...args: any[]): {}
}

interface ResponseFormat<T> {
  success: boolean;
  messages: string[];
  error: string | null;
  statusCode: number;
  data: any;
}

interface ExtraData {
  key: string,
  dto?: ClassConstructor,
}

export function Serialize(dto: ClassConstructor, message: string = 'Request successful', extraData?: ExtraData ) {
  return UseInterceptors(new SerializeInterceptor(dto, message, extraData))
}

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: any, private message: string, private extraData?: ExtraData){}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any): ResponseFormat<T> => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        if(data && data.data && data.meta && data.links) {
          const returnedDataFormat = {
            success: statusCode >= 200 && statusCode < 300,
            messages: [this.message],
            error: null,
            statusCode,
            data: {
              items: plainToClass(this.dto, data.data, {
                excludeExtraneousValues: true,
              }),
              meta: data.meta,
              links: data.links,
            },
          };
          if(data.extraData && this.extraData) {
            returnedDataFormat.data[this.extraData.key] = this.extraData.dto ? plainToClass(this.extraData.dto, data.extraData, {excludeExtraneousValues: true}) : data.extraData
          }
          return returnedDataFormat;
        }
        let newFormat = plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
        return {
          success: statusCode >= 200 && statusCode < 300,
          messages: [this.message],
          error: null,
          statusCode,
          data: newFormat,
        };
        
      }),
    );
  }
}
