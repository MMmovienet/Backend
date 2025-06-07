import { BaseEntity } from "src/common/database/base.entity";
import { Movie } from "src/movies/entities/movie.entity";
import { Serie } from "src/series/entities/serie.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Vote } from "./vote.entity";
import { User } from "src/users/entities/user.entity";

@Entity("posts")
export class Post extends BaseEntity<Post> {
    @Column({ type: "varchar", length: 20000,})
    text: string;

    @ManyToOne(() => User, (user) => user.posts)
    user: User;

    @ManyToOne(() => Movie, (movie) => movie.posts, {onDelete: "CASCADE"})
    movie: Movie;

    @ManyToOne(() => Serie, (serie) => serie.posts, {onDelete: 'CASCADE'})
    serie: Serie;

    @OneToMany(() => Vote, (vote) => vote.post, {cascade: true})
    votes: Vote[];
}
