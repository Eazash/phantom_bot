import { Team } from 'src/team/entities/team.entity';
import { TelegramUser } from 'src/team/entities/telegarm-user.entity';
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import { TeamSeed } from 'src/database/migrations/team.seed';
import {
  MOON_ALPHA_SEED,
  MOON_BETA_SEED,
  NIGHT_ALPHA_SEED,
  NIGHT_BETA_SEED,
} from 'src/database/migrations/user.seed';

export class seedTeam1651598444678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const teamRepo = getRepository(Team);
    const userRepo = getRepository(TelegramUser);
    const teams = await teamRepo.save(TeamSeed);
    const nightstalker = await teamRepo.findOne({ short: 'nightstalker' });
    const alphaNS = await userRepo.save(NIGHT_ALPHA_SEED);
    const betasNS = await userRepo.save(NIGHT_BETA_SEED);
    nightstalker.alpha = alphaNS;
    nightstalker.betas = betasNS;

    const moonstone = await teamRepo.findOne({ short: 'moonstone' });
    const alphaMS = await userRepo.save(MOON_ALPHA_SEED);
    const betaMS = await userRepo.save(MOON_BETA_SEED);

    moonstone.alpha = alphaMS;
    moonstone.betas = betaMS;

    await teamRepo.save([nightstalker, moonstone]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // just sit there and look pretty
    await getRepository(Team).delete({});
  }
}
