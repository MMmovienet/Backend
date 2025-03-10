import { Expose, Transform } from "class-transformer";

export class PosterDto {
    @Expose()
    id: number;

    @Expose()
    @Transform(({value}) => `${process.env.APP_URL}/uploads/posters/${value}`)
    src: string;
}