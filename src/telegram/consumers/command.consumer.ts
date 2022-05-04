import { Process, Processor } from '@nestjs/bull';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { catchError, from, map, reduce, switchMap, throwError } from 'rxjs';
import { Team } from 'src/team/entities/team.entity';
import { TelegramUser } from 'src/team/entities/telegarm-user.entity';
import { Repository } from 'typeorm';
import { FormattingOption } from '../constants';
import { TelegramService } from '../telegram.service';
import { Message } from '../types';

@Injectable()
@Processor({ name: 'command', scope: Scope.REQUEST })
export class CommandConsumer {
  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(TelegramUser)
    private readonly userRepo: Repository<TelegramUser>,
  ) {}
  @Process('register')
  registerUser(job: Job<Message>) {
    const message = job.data;

    const firstIndexOfSpace = message.text.indexOf(' ');
    const teamName = message.text.substring(
      firstIndexOfSpace + 1,
      message.text.length,
    );
    from(teamName)
      .pipe(
        // concat letters into string
        reduce((acc, val) => acc + val),
        // get team from DB
        switchMap((name) => from(this.teamRepo.findOne({ short: name }))),
        switchMap(async (team) => {
          if (team === undefined) {
            throw new Error('Invalid Team Name');
          }
          let user = await this.userRepo.findOne({
            where: { user_id: message.from.id, chat_id: message.chat.id },
            relations: ['team'],
          });
          if (user === undefined) {
            user = this.userRepo.create({
              user_id: message.from.id,
              name: message.from.first_name,
              username: message.from.username,
            });
          }
          user.team = team;
          return this.userRepo.save(user);
        }),
        switchMap((user) => {
          return this.telegramService.sendMessage({
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: `User ${user.name} added to Team  ${teamName}`,
          });
        }),
        catchError((error) => {
          console.error(error);
          return this.telegramService.sendMessage({
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: error?.message,
          });
        }),
      )
      .subscribe({
        next: (sentMessage) => console.log(sentMessage),
      });
  }
  @Process('list')
  listTeams(job: Job<Message>) {
    const message = job.data;
    from(this.teamRepo.find({ relations: ['users', 'alpha', 'betas'] }))
      .pipe(
        map((teams) => {
          let text = '';
          teams.forEach((team) => {
            text = text.concat(`__*${team.name}*__\n`);
            text = text.concat(`👑Alpha: ${team.alpha.name}\n`);
            text = text.concat(
              `💍Betas: ${team.betas.map((beta) => beta.name).join(' , ')}\n`,
            );
            text = text.concat('Pack: \n');
            team.users
              .filter((user) => user.chat_id === message.chat.id)
              .forEach((user) => {
                if (user.username !== undefined) {
                  text = text.concat(
                    `[@${user.username}](tg://user?id=${user.id})\n`,
                  );
                } else {
                  text = text.concat(
                    `[${user.name}](tg://user?id=${user.id})\n`,
                  );
                }
              });
            text = text.concat('\n');
          });
          return text;
        }),
        switchMap((text) => {
          return this.telegramService.sendMessage({
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text,
            parse_mode: FormattingOption.MARKDOWN,
          });
        }),
        catchError((error) => {
          console.log(error);
          return this.telegramService.sendMessage({
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: error.message,
          });
        }),
      )
      .subscribe({
        next: (sentMessage) => console.log(sentMessage),
      });
  }
}
