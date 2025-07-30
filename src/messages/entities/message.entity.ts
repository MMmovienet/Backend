import { BaseEntity } from "src/common/database/base.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('messages')
export class Message extends BaseEntity<Message> {
    @Column({ type: "text",})
    text: string;

    @ManyToOne(() => User, (user) => user.votes, {onDelete: 'CASCADE'})
    user: User;
}
