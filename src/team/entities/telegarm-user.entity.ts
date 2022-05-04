import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class TelegramUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: number;

  @Column()
  name: string;

  @Column()
  username?: string;

  @ManyToOne(() => Team, (team: Team) => team.users, { onDelete: 'CASCADE' })
  team: Team;

  @Column({ nullable: true })
  chat_id?: number;

  @ManyToOne(() => Team, (team: Team) => team.betas, { onDelete: 'CASCADE' })
  beta_on_team: Team;
}
