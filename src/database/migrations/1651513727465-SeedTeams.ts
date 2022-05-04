import { Team } from 'src/team/entities/team.entity';
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import { TeamSeed } from './team.seed';

export class SeedTeams1651513727465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const teams = await getRepository(Team).save(TeamSeed);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // just sit there and look pretty
    await getRepository(Team).delete({});
  }
}
