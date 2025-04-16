import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyRequest, FastifyReply } from 'fastify'

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const userAgent = req.headers['user-agent']
    const xApiKey = req.headers['x-api-key']

    if (userAgent !== 'Services/1.0.0 (24aeeb2b43db)' || xApiKey !== 'e278017841df') {
      return res.destroy()
    }
    
    next()
  }
}
