import { HttpModule } from '@nestjs/axios';
import {
  forwardRef,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AxiosError } from 'axios';
import { of, repeat, retry, Subscription, switchMap, tap } from 'rxjs';
import { AppModule } from 'src/app.module';
import { AppService } from 'src/app.service';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService],
  imports: [HttpModule, ConfigModule, forwardRef(() => AppModule)],
})
export class TelegramModule implements OnModuleInit, OnModuleDestroy {
  private offset: number;
  private timeout: number;
  private update$: Subscription;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly appService: AppService,
  ) {
    this.timeout = this.appService.isInProduction ? 10 : 0;
  }

  onModuleInit() {
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
              : undefined),
        ),
      )
      .subscribe({
        next: (update) => console.log(update),
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
}
