import { Expose, Transform } from "class-transformer";

export class BaseDto {
    @Expose()
    id: string;
    
    @Expose()
    @Transform(({ value }) => value ? new Date(value).toLocaleString() : null)
    createdAt: Date;

    @Expose()
    @Transform(({ value }) => value ? new Date(value).toLocaleString() : null)
    updatedAt: Date;
}