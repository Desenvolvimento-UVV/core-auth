import { client } from './client'
import { prisma } from './database'
import config from './config'

async function bootstrap() {
  await prisma.$connect()
  await client.login(config.TOKEN)
}

bootstrap()
