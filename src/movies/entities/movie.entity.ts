import { BaseEntity } from "src/common/database/base.entity";
import { Genre } from "src/genres/entities/genre.entity";
import { Column, Entity, OneToMany } from "typeorm";


@Entity("movies")
export class Movie extends BaseEntity<Movie> {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    src: string;

    @OneToMany(() => Genre, (genre) => genre.movie)
    genres: Genre[]
}
