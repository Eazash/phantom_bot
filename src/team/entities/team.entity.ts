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

  @OneToMany(() => TelegramUser, (user: TelegramUser) => user.team, {
    cascade: true,
  })
  users: TelegramUser[];

  @OneToOne(() => TelegramUser, { cascade: true })
  @JoinColumn()
  alpha: TelegramUser;

  @OneToMany(() => TelegramUser, (user: TelegramUser) => user.beta_on_team, {
    cascade: true,
  })
  betas: TelegramUser[];
}
