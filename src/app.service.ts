import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  get isInProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }
}
