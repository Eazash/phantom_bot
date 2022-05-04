import { FormattingOption } from '../constants';
import { BotCommand, BotCommandScope } from './objects.interface';

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowed_updates?: string[];
}

export interface SetMyCommandsParams {
  commands: BotCommand[];
  scope: BotCommandScope;
}

export interface GetChatMemberParams {
  chat_id: number | string;
  user_id: number | string;
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  reply_to_message_id?: number;
  parse_mode?: FormattingOption;
}

export interface GetChatAdministratorsParams {
  chat_id: number | string;
}
