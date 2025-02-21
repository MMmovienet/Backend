import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity('genres')
export class Genre extends BaseEntity<Genre> {
    @Column({type: String, unique: true})
    name: string
}
