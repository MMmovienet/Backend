
import { BaseEntity } from 'src/common/database/base.entity';
import { Episode } from 'src/episodes/entities/episode.entity';
import { Genre } from 'src/genres/entities/genre.entity';
import { Season } from 'src/seasons/entities/season.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity("series")
export class Serie extends BaseEntity<Serie> {
    @Column()
    name: string;

    @Column({type: 'text'})
    description: string;

    @Column()
    release_date: string; 

    @Column()
    main_poster: string;

    @Column({nullable: true})
    cover_poster: string;

    @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true, onDelete: 'CASCADE'})
    @JoinTable({name: "serie_genres"})
    genres: Genre[];

    @OneToMany(() => Season, (season) => season.serie, {cascade: true})
    seasons: Season[];

    @OneToMany(() => Episode, (episode) => episode.serie, {cascade: true})
    episodes: Episode[];
}
