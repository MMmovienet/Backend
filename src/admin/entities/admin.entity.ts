import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Admin extends BaseEntity<Admin> {
    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column({nullable: true, type: 'varchar', default: null})
    image: string | null;

    @Column()
    password: string;
}
