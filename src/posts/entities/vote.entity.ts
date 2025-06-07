import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity, ManyToOne, RelationId, Unique } from "typeorm";
import { Post } from "./post.entity";
import { User } from "src/users/entities/user.entity";
import { VoteType } from "src/common/enums/VoteType";

@Entity("votes")
@Unique(['user', 'post'])
export class Vote extends BaseEntity<Vote> {
    @Column({type: 'enum', enum: VoteType})
    type: VoteType;

    @ManyToOne(() => Post, (post) => post.votes, {onDelete: 'CASCADE'})
    post: Post;

    @ManyToOne(() => User, (user) => user.votes, {onDelete: 'CASCADE'})
    user: User;

    @RelationId((vote: Vote) => vote.user)
    userId: Number;

    @RelationId((vote: Vote) => vote.post)
    postId: Number;
}