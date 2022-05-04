import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRoot(DatabaseConfig)],
})
export class DatabaseModule {}
