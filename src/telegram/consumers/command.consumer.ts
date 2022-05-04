import { Process, Processor } from '@nestjs/bull';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { catchError, from, map, reduce, switchMap, throwError } from 'rxjs';
import { Team } from 'src/team/entities/team.entity';
import { TelegramUser } from 'src/team/entities/telegarm-user.entity';
import { Repository } from 'typeorm';
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
        switchMap((name) => from(this.teamRepo.findOne({ name }))),
        switchMap(async (team) => {
          if (team === undefined) {
            throw new Error('Invalid Team Name');
          }
          let user = await this.userRepo.findOne({
            where: { user_id: message.from.id },
            relations: ['team'],
          });
          if (user !== undefined) {
            throw new Error(`User already registered to ${user.team.name}`);
          }
          user = this.userRepo.create({
            user_id: message.from.id,
            name: message.from?.username || message.from.first_name,
            team,
          });
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
}
