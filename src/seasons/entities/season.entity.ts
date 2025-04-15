import { BaseEntity } from "src/common/database/base.entity";
import { Episode } from "src/episodes/entities/episode.entity";
import { Serie } from "src/series/entities/serie.entity";
import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";

@Entity("seasons")
@Unique(["number", "serie"])
export class Season extends BaseEntity<Season>{
    @Column()
    number: Number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    release_date: string; 

    @ManyToOne(() => Serie, (serie) => serie.seasons, {onDelete: "CASCADE"})
    serie: Serie;

    @OneToMany(() => Episode, (episode) => episode.season, {cascade: true})
    episodes: Episode[];
}