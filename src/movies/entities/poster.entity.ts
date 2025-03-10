import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Movie } from "./movie.entity";

@Entity()
export class Poster extends BaseEntity<Poster> {
    @Column()
    src: string;

    @ManyToOne(() => Movie, (movie) => movie.posters, {onDelete: "CASCADE"})
    movie: Movie
}

