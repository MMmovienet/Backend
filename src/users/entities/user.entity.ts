import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";
import { Party } from "src/parties/entities/party.entity";
import { Vote } from "src/posts/entities/vote.entity";
import { Post } from "src/posts/entities/post.entity";

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

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Vote, (vote) => vote.user, {cascade: true})
    votes: Vote[];
}
