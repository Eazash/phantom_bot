import { HttpModule } from '@nestjs/axios';
import { BullModule, InjectQueue } from '@nestjs/bull';
import {
  forwardRef,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { Queue } from 'bull';
import {
  firstValueFrom,
  of,
  repeat,
  retry,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { AppModule } from 'src/app.module';
import { AppService } from 'src/app.service';
import { Team } from 'src/team/entities/team.entity';
import { TelegramUser } from 'src/team/entities/telegarm-user.entity';
import {
  BotCommandScopeType,
  Command,
  DEFAULT_COMMANDS,
  MessageEntityType,
} from './constants';
import { CommandConsumer } from './consumers/command.consumer';
import { NewMemberConsumer } from './consumers/new-member.consumer';
import { TelegramService } from './telegram.service';
import * as Telegram from './types';
import { Message, MessageEntity, MyChatMember, Update } from './types';

@Module({
  providers: [TelegramService, CommandConsumer, NewMemberConsumer],
  imports: [
    HttpModule,
    ConfigModule,
    forwardRef(() => AppModule),
    BullModule.registerQueue({ name: 'command' }),
    BullModule.registerQueue({ name: 'newMember' }),
    TypeOrmModule.forFeature([Team, TelegramUser]),
  ],
})
export class TelegramModule implements OnModuleInit, OnModuleDestroy {
  private offset: number;
  private timeout: number;
  private update$: Subscription;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly appService: AppService,
    @InjectQueue('command')
    private readonly commandQueue: Queue<Telegram.Message>,
    @InjectQueue('newMember')
    private readonly newMemberQueue: Queue<Telegram.MyChatMember>,
  ) {
    this.timeout = this.appService.isInProduction ? 21600 : 0;
  }

  async onModuleInit() {
    await firstValueFrom(
      this.telegramService.setMyCommands({
        commands: DEFAULT_COMMANDS,
        scope: { type: BotCommandScopeType.DEFAULT },
      }),
    );
    this.update$ = of({})
      .pipe(
        switchMap(() =>
          this.telegramService.getUpdates({
            offset: this.offset,
            timeout: this.timeout,
          }),
        ),
        repeat(),
        retry(3),
        tap(
          (updates) =>
            (this.offset = updates.length
              ? updates.at(-1).update_id + 1
              : this.offset),
        ),
      )
      .subscribe({
        next: (update) => this.produceJobs(update),
        error: (error) => {
          if (error?.isAxiosError) {
            const axiosError = error as AxiosError;
            console.error(axiosError.response);
          } else {
            console.error(error);
          }
        },
      });
  }
  onModuleDestroy() {
    this.update$.unsubscribe();
  }

  produceJobs(updates: Update[]) {
    updates.forEach((update) => {
      let entity: MessageEntity;
      if (
        (entity = update.message?.entities?.find(
          (entity) => entity.type === MessageEntityType.COMMAND,
        ))
      ) {
        this.commandProducer(update.message, entity);
      } else if (update?.my_chat_member?.new_chat_member) {
        this.newMemberProducer(update.my_chat_member);
      }
    });
  }
  newMemberProducer(my_chat_member: MyChatMember) {
    this.newMemberQueue.add(my_chat_member);
  }

  commandProducer(message: Message, commandEntity: MessageEntity) {
    const command = message.text
      .substring(commandEntity.offset, commandEntity.length)
      .split('@')[0];
    switch (command) {
      case Command.REGISTER:
        this.commandQueue.add('register', message);
        break;
      case Command.LIST:
        this.commandQueue.add('list', message);
      default:
        this.commandQueue.add('unknown', message);
        break;
    }
  }
}
