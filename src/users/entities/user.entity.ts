import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";

@Entity("users")
export class User extends BaseEntity<User> {
    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column({nullable: true, type: 'varchar', default: null})
    image: string | null;

    @Column()
    password: string;
}
