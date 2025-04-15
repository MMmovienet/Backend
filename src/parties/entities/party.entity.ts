import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";
import { User } from "src/users/entities/user.entity";
import { Movie } from "src/movies/entities/movie.entity";
import { Episode } from "src/episodes/entities/episode.entity";

@Entity("parties")
export class Party extends BaseEntity<Party> {
    @Column()
    partyId: string;

    @Column()
    title: string;

    @Column()
    src: string;

    @ManyToOne(() => Movie, (movie) => movie.parties, {onDelete: "CASCADE", nullable: true},)
    movie: Movie;

    @ManyToOne(() => Episode, (episode) => episode.parties, {onDelete: "CASCADE", nullable: true})
    episode: Episode;

    @ManyToOne(() => User, (admin) => admin.parties, {onDelete: "CASCADE", nullable: false})
    admin: User;

    @ManyToMany(() => User, (user) => user.member_parties)
    members: User[];
}
