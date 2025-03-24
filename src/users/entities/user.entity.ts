import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";
import { Party } from "src/party/entities/party.entity";

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

    @OneToMany(() => Party, (party) => party.admin, {cascade: true})
    parties: Party[];

    @ManyToMany(() => Party, (party) => party.members, { cascade: true, onDelete: 'CASCADE'})
    @JoinTable({name: "user_parties"})
    member_parties: Party[];
}
