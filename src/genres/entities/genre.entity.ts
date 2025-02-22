import { BaseEntity } from "src/common/database/base.entity";
import { Movie } from "src/movies/entities/movie.entity";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";

@Entity('genres')
export class Genre extends BaseEntity<Genre> {
    @Column({type: String, unique: true})
    name: string

    @ManyToMany(() => Movie, (movie) => movie.genres)
    movies: Movie[];
}
