import { NestFactory } from '@nestjs/core'
import { ValidationPipe, BadRequestException } from '@nestjs/common'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import multiPart from '@fastify/multipart'
import { Modules } from './modules'
import config from './config'

function customExceptionFactory(errors) {
  if (!errors?.length) {
    return new BadRequestException({ statusCode: 400, message: 'Validation failed!' })
  }

  for (const error of errors) {
    if (error.constraints && Object.keys(error.constraints).length > 0) {
      const constraints = error.constraints
      const constraintKeys = Object.keys(constraints)
      const firstConstraintKey = constraintKeys.length > 0 ? constraintKeys[0] : null
      const message = firstConstraintKey ? constraints[firstConstraintKey] : 'Validation failed!'

      return new BadRequestException({ statusCode: 400, message })
    }

    if (error.children && error.children.length > 0) {
      return customExceptionFactory(error.children)
    }
  }

  return new BadRequestException({ statusCode: 400, message: 'Validation failed!' })
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    Modules,
    new FastifyAdapter(),
    { logger: ['error', 'warn'] }
  )

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: customExceptionFactory,
      stopAtFirstError: true,
      whitelist: true,
      transform: true
    })
  )

  await app.register(multiPart as any, {
    limits: {
      fileSize: 60 * 1024 * 1024
    }
  })

  app.use('trust proxy', true)

  await app.listen(config.PORT)
}

bootstrap()
