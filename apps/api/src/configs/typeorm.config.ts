import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export const typeOrmModuleAsyncOptions: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '5432')),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'root'),
    database: configService.get<string>('DB_NAME', 'postgres-db'),
    autoLoadEntities: true,
    synchronize: false,
    schema: 'public',
    ssl:
      configService.get<string>('DB_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : false,
  }),
  inject: [ConfigService],
};
