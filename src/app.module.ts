import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import appConfigSchema from './app.config';
import { AppService } from './app.service';
import telegramConfigSchema from './telegram/telegram.config';
import { TelegramModule } from './telegram/telegram.module';
import { DatabaseModule } from './database/database.module';
import { TeamModule } from './team/team.module';
import databseConfigSchema from './database/database-schema.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...telegramConfigSchema,
        ...databseConfigSchema,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    TelegramModule,
    DatabaseModule,
    TeamModule,
  ],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
