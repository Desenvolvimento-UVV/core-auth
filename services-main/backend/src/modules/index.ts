import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from './user.module'
import { AppModule } from './app.module'
import { SecurityMiddleware } from 'src/middlewares'
import config from 'src/config'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: '12h' }
    }),
    UserModule,
    AppModule
  ],
  controllers: [],
  providers: []
})

export class Modules implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*')
  }
}