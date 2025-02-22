import { BaseEntity } from "src/common/database/base.entity";
import { Genre } from "src/genres/entities/genre.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";


@Entity("movies")
export class Movie extends BaseEntity<Movie> {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    src: string;

    @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true, onDelete: 'CASCADE'})
    @JoinTable({name: "movie_genres"})
    genres: Genre[]
}
