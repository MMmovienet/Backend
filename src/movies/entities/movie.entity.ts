import { BaseEntity } from "src/common/database/base.entity";
import { Genre } from "src/genres/entities/genre.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Poster } from "./poster.entity";
import { Party } from "src/parties/entities/party.entity";


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
    genres: Genre[];

    @OneToMany(() => Poster, (poster) => poster.movie, {cascade: true})
    posters: Poster[];

    @OneToMany(() => Party, (party) => party.movie, {cascade: true})
    parties: Party[];
}
