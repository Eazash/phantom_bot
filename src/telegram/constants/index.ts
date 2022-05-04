import { BotCommand } from '../types';

export const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
export enum MessageEntityType {
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  CASHTAG = 'cashtag',
  COMMAND = 'bot_command',
  URL = 'url',
  EMAIL = 'email',
}

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  SUPERGROUP = 'supergroup',
  CHANNEL = 'channel',
}

export enum Command {
  START = '/start',
  REGISTER = '/register',
  LIST = '/list',
}

export const DEFAULT_COMMANDS: BotCommand[] = [
  {
    command: 'start',
    description: 'Start the bot',
  },
  {
    command: 'register',
    description: 'Register a user to a team. (/register $teamName @username)',
  },
  {
    command: 'list',
    description: 'List teams and their members',
  },
];

export enum BotCommandScopeType {
  DEFAULT = 'default',
  ALL_PRIVATE_CHATS = 'all_private_chats',
  ALL_GROUP_CHATS = 'all_group_chats',
  ALL_CHAT_ADMINISTRATORS = 'all_chat_administrators',
  CHAT = 'chat',
  CHAT_ADMINISTRATORS = 'chat_administrators',
  BOT_COMMAND_SCOPE_CHAT_MEMBER = 'chat_member',
}

export enum ChatMemberStatus {
  OWNER = 'owner',
  ADMINISTRATOR = 'administrator',
  MEMBER = 'member',
}
