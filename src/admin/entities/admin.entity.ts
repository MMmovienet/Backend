import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Admin extends BaseEntity<Admin> {
    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    image: string;
}
