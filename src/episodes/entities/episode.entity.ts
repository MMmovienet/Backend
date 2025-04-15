import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId, Unique } from "typeorm";
import { Party } from "src/parties/entities/party.entity";
import { Serie } from "src/series/entities/serie.entity";
import { Season } from "src/seasons/entities/season.entity";

@Entity("episodes")
@Unique(["number", "season"])
export class Episode extends BaseEntity<Episode>{
    @Column()
    number: Number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    src: string;

    @RelationId((episode: Episode) => episode.serie)
    serieId: Number;

    @RelationId((episode: Episode) => episode.season)
    seasonId: Number;

    @ManyToOne(() => Serie, (serie) => serie.episodes, {onDelete: "CASCADE", nullable: false})
    serie: Serie;

    @ManyToOne(() => Season, (season) => season.episodes, {onDelete: "CASCADE", nullable: true})
    season: Season;

    @OneToMany(() => Party, (party) => party.movie, {cascade: true})
    parties: Party[];
}