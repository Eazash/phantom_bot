import { Process, Processor } from '@nestjs/bull';
import { Injectable, Scope } from '@nestjs/common';
import { map, switchMap, tap } from 'rxjs';
import { Job } from 'bull';
import { TelegramService } from '../telegram.service';
import { Message, MyChatMember } from '../types/objects.interface';
import { BotCommandScopeType, DEFAULT_COMMANDS } from '../constants';

@Injectable()
@Processor({ name: 'newMember', scope: Scope.REQUEST })
export class NewMemberConsumer {
  constructor(private readonly telegramService: TelegramService) {}
  @Process()
  onNewChatAdded(job: Job<MyChatMember>) {
    const myChatMember = job.data;

    return this.telegramService
      .setMyCommands({
        commands: DEFAULT_COMMANDS,
        scope: {
          type: BotCommandScopeType.ALL_GROUP_CHATS,
          chat_id: myChatMember.chat.id,
        },
      })
      .subscribe();
  }
}
