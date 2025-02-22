import { BaseEntity } from "src/common/database/base.entity";
import { Movie } from "src/movies/entities/movie.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('genres')
export class Genre extends BaseEntity<Genre> {
    @Column({type: String, unique: true})
    name: string

    @ManyToOne(() => Movie, (movie) => movie.genres)
    movie: Movie;
}
