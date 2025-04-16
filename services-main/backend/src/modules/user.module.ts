import { Module } from '@nestjs/common'
import { UserController } from 'src/controllers'
import { UserService, PrismaService } from 'src/services'

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService]
})

export class UserModule {}
