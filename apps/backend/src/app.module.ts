import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EquipamentModule } from './equipament/equipament.module';
import { CoffeesModule } from './coffees/coffees.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    EquipamentModule,
    CoffeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
