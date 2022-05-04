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

  @ManyToOne(() => Team, (team: Team) => team.users)
  team: Team;
}