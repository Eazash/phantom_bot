import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';
import * as Telegram from './types';
import {
  ChatMember,
  GetChatAdministratorsParams,
  GetChatMemberParams,
  Message,
  SendMessageParams,
  SetMyCommandsParams,
  User,
} from './types';

@Injectable()
export class TelegramService {
  private apiURL: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiURL = `${this.configService.get(
      'TELEGRAM_API_URL',
    )}${this.configService.get('BOT_KEY')}`;
  }

  private callAPI<T>(
    endpoint: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Observable<T> {
    return this.httpService
      .post(`${this.apiURL}/${endpoint}`, data, requestConfig)
      .pipe(
        map((response: AxiosResponse<Telegram.Response>) => {
          if (!response.data.ok) {
            throw new Error(response.data.description);
          }
          return response.data.result;
        }),
      );
  }

  getUpdates(
    options?: Telegram.GetUpdatesParams,
  ): Observable<Telegram.Update[]> {
    return this.callAPI<Telegram.Update[]>(this.getUpdates.name, options);
  }

  getMe(): Observable<Telegram.User> {
    return this.callAPI<Telegram.User>(this.getMe.name);
  }

  setMyCommands(options: SetMyCommandsParams): Observable<unknown> {
    return this.callAPI(this.setMyCommands.name, options);
  }

  getChatMember(options: GetChatMemberParams): Observable<ChatMember> {
    return this.callAPI(this.getChatMember.name, options);
  }

  sendMessage(options: SendMessageParams) {
    return this.callAPI<Message>(this.sendMessage.name, options);
  }

  getChatAdministrators(
    options: GetChatAdministratorsParams,
  ): Observable<Telegram.ChatMember[]> {
    return this.callAPI<ChatMember[]>(this.getChatAdministrators.name, options);
  }
}
