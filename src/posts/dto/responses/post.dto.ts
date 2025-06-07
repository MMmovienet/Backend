import { Expose, Transform } from "class-transformer";
import { BaseDto } from "src/common/dto/base.dto";
import { formatDistanceToNow } from "date-fns";
import { Movie } from "src/movies/entities/movie.entity";
import { Serie } from "src/series/entities/serie.entity";

export class PostDto extends BaseDto {
    @Expose()
    @Transform(({ value }) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : null)
    createdAt: Date;

    @Expose()
    text: string;

    @Expose()
    upvoteCount: number;

    @Expose()
    downvoteCount: number;

    @Expose()
    @Transform((data) => {
        return data.obj.user.name;
    })
    username: string;

    @Expose()
    @Transform((data) => {
        const user = data.obj.user;
        return user.image ? 
                `${process.env.APP_URL}/uploads/users/${user.image}`: 
                `https://ui-avatars.com/api/?background=222E41&color=fff&name=${user.name}`;
    })
    userImage: string;

    @Expose()
    @Transform((data) => {
        const post = data.obj;
        const item: Movie | Serie = post.movie ? post.movie : post.serie
        return item.name;
    })
    name: string;

    @Expose()
    @Transform((data) => {
        const post = data.obj;
        const item: Movie | Serie = post.movie ? post.movie : post.serie

        return `${process.env.APP_URL}/uploads/posters/${item.main_poster}`;
    })
    poster: string;

    @Expose()
    @Transform((data) => {
        const movie: null | Movie = data.obj.movie;
        return movie ? movie.id : null;
    })
    movieId: number;

    @Expose()
    @Transform((data) => {
        const serie: null | Serie = data.obj.serie;
        return serie ? serie.id : null;
    })
    serieId: number;
}