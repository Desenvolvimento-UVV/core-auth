import { Module } from '@nestjs/common'
import { AppController } from 'src/controllers'
import { AppService, PrismaService } from 'src/services'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService]
})

export class AppModule {}
