import {
  BotCommandScopeType,
  ChatMemberStatus,
  ChatType,
  MessageEntityType,
} from '../constants';

export interface Chat {
  id: number;
  type: ChatType;
  title?: string;
  username?: string;
}

export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}
export interface BotCommand {
  command: string;
  description: string;
}

export interface BotCommandScope {
  type: BotCommandScopeType;
  chat_id?: number | string;
  user_id?: number | string;
}
export interface MessageEntity {
  type: MessageEntityType;
  offset: number;
  length: number;
  url?: string;
  language?: string;
}

export interface Message {
  message_id: number;
  date: number;
  entities: MessageEntity[];
  chat: Chat;
  text?: string;
  from?: User;
  new_chat_members?: User[];
}

export interface Update {
  update_id: number;
  message?: Message;
  my_chat_member: MyChatMember;
}

export interface ChatMember {
  status: ChatMemberStatus;
  user: User;
}

export interface MyChatMember {
  chat: Chat;
  new_chat_member: ChatMember;
  old_chat_member: ChatMember;
}
