import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TelegramUser } from './telegarm-user.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => TelegramUser, (user: TelegramUser) => user.team)
  users: TelegramUser[];
}
