import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from './prisma.service'
import utils from 'src/utils'

@Injectable()
export class AppService {
  constructor (private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async report ({ unique, type, description }, image, req, res) { 
    if (!image || !image.buffer) {
      return res.status(400).send({
        statusCode: 400,
        message: 'Invalid image!'
      })
    }
    
    const pngBuffer = await utils.convertToPng(image.buffer)

    if (!utils.isValidPngImage(pngBuffer)) {
      return res.status(400).send({
        statusCode: 400,
        message: 'Invalid image format!'
      })
    }

    if (!['open', 'blacklist'].includes(type)) {
      return res.status(400).send({
        statusCode: 400,
        message: 'Invalid report type!'
      })
    }

    const identifierQuery = await this.prisma.identifiers.findFirst({
      where: { unique }
    })

    const accountRegistered = !!(identifierQuery)
    let userQuery;
    
    if (accountRegistered) {
      userQuery = await this.prisma.users.findFirst({
        where: { id: identifierQuery.userId }
      })
    }

    const ip = req.headers['cf-connecting-ip'] || req.ip

    const basicInformation = `
      ## Informations
  
      **Unique**: ||${unique}||
      **IP**: ||${ip}||
      **Account**: ${accountRegistered ? `Yes ||(${userQuery.username})||` : 'No'}
      
      ${description}
      `

    type WebHookConfig = Record<string, { webhook: string, title: string }>
    const webHookConfig: WebHookConfig = {
      'open': { webhook: 'open', title: 'Open' },
      'blacklist': { webhook: 'security', title: 'Blacklist' }
    }

    if (type == 'blacklist') {
      if (accountRegistered) {
        await this.prisma.bans.update({
          where: { userId: identifierQuery.userId },
          data: { banned: true, reason: 'Malicious' }
        })
      }

      const blacklistQuery = await this.prisma.blacklists.findFirst({
        where: { unique }
      })

      if(!blacklistQuery) {
        await this.prisma.blacklists.create({ 
          data: { unique, description } 
        })
      }
    }

    const { webhook, title } = webHookConfig[type]
    await utils.webHook(webhook, title, pngBuffer, basicInformation)

    return res.status(201).send({
      statusCode: 201,
      message: 'Sent with successfully!'
    })
  }

  async status ({ unique }, res) {
    const query = await this.prisma.blacklists.findFirst({ 
      where: { unique } 
    })

    const isBlacklisted = !!(query)

    type Response = {
      statusCode: number
      isBlacklisted: boolean
      blacklistLevel?: string
      appVersion: string
    }
    
    const response: Response = {
      statusCode: 200,
      isBlacklisted,
      appVersion: utils.getAppVersion()
    }
  
    if (isBlacklisted) {
      response.blacklistLevel = query.level
    }
  
    return res.status(200).send(response)
  }
}
