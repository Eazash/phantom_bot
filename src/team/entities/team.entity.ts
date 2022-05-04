import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TelegramUser } from './telegarm-user.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  short: string;

  @OneToMany(() => TelegramUser, (user: TelegramUser) => user.team)
  users: TelegramUser[];

  @OneToOne(() => TelegramUser)
  @JoinColumn()
  alpha: TelegramUser;

  @OneToMany(() => TelegramUser, (user: TelegramUser) => user.beta_on_team)
  betas: TelegramUser[];
}
