import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ObserverModule } from './observer/observer.module';
import { SingletonController } from './singleton/singleton.controller';
import { RootController } from './root.controller';
import { SingletonService } from './singleton/singleton.service';

@Module({
  imports: [ObserverModule],
  controllers: [RootController, SingletonController],
  providers: [PrismaService, SingletonService],
})
export class AppModule {}
