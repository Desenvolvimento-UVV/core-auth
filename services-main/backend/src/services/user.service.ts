import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { PrismaService } from './prisma.service'
import utils from 'src/utils'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) { }

  async me(req, res) {
    const { id: userId } = req.user

    const userQuery = await this.prisma.users.findFirst({
      where: { id: userId },
      include: { subscriptions: true, ban: true }
    })

    if (!userQuery || userQuery.ban.banned) {
      return res.status(403).send({
        statusCode: 403,
        message: 'you are not allowed to do that.'
      })
    }

    const formattedProfile = utils.excludeProperties(userQuery, [
      'password', 'updatedAt', 'subscriptions', 'createdAt', 'ban'
    ])

    const products = await this.prisma.products.findMany({
      include: { strings: true }
    })

    const formattedSubscriptions = userQuery.subscriptions
      .map(({ productId, expireTime }) => {
        const product = products.find(({ id }) => id === productId)

        if (!product)
          return null

        const formattedExpireTime = utils.formatExpireTime(Number(expireTime))

        if (formattedExpireTime === "Expired")
          return null

        return {
          image: product.image,
          downloadUrl: product.downloadUrl,
          name: product.name,
          version: product.version,
          status: product.status,
          expireTime: formattedExpireTime,
          strings: product.strings.map(({ data, ...rest }) => ({
            ...utils.excludeProperties(rest, ['id', 'productId']),
            data: data.map((str) => utils.xor(Buffer.from(str))),
          })),
        }
      })
      .filter(Boolean)

    return res.status(200).send({
      statusCode: 200,
      profile: formattedProfile,
      subscriptions: formattedSubscriptions
    })
  }

  async login({ username, password, hardware }, req, res) {
    const userQuery = await this.prisma.users.findFirst({
      where: { username }, include: { ban: true, identifier: true }
    })

    if (!userQuery || !(await verify(userQuery.password, password))) {
      return res.status(401).send({
        statusCode: 401,
        message: 'The username or password you entered is incorrect.'
      })
    }

    if (userQuery.ban.banned) {
      return res.status(403).send({
        statusCode: 403,
        message: `You are currently banned by an administrator. Reason: ${userQuery.ban.reason}`
      })
    }

    const ip = req.headers['cf-connecting-ip'] || req.ip

    if (userQuery.identifier.unique === 'not set') {
      await this.prisma.identifiers.update({
        where: { userId: userQuery.id },
        data: {
          cpu: hardware.cpu,
          gpu: hardware.gpu,
          ram: hardware.ram,
          unique: hardware.unique
        },
      })
    } else if (userQuery.identifier.unique !== hardware.unique) {
      return res.status(403).send({
        statusCode: 403,
        message: 'Hardware mismatch, contact an administrator.'
      })
    }

    const token = await this.jwt.signAsync({
      id: userQuery.id
    })

    await this.prisma.identifiers.update({
      where: { userId: userQuery.id },
      data: { location: ip }
    })

    return res.status(200).send({
      statusCode: 200,
      message: 'Logged In!',
      token
    })
  }

  async create({ username, password, productKey, hardware }, req, res) {
    const keyQuery = await this.prisma.keys.findFirst({ 
      where: { productKey 
    } })
    
    if (!keyQuery) {
      return res.status(401).send({
        statusCode: 401,
        message: 'The product key provided is invalid.'
      })
    }

    const queryUser = await this.prisma.users.findFirst({ 
      where: { username } 
    })

    if (queryUser) {
      return res.status(409).send({
        statusCode: 409,
        message: 'This username is already being used.'
      })
    }

    const ip = req.headers['cf-connecting-ip'] || req.ip

    const { productId, productTime } = keyQuery
    const expireTime = BigInt(Date.now()) + BigInt(productTime * 86400000)

    await this.prisma.users.create({
      data: {
        username,
        password: await hash(password as string),
        ban: { create: {} },
        subscriptions: {
          create: {
            productId,
            expireTime,
            productKeys: [productKey]
          }
        },
        identifier: {
          create: {
            cpu: hardware.cpu,
            gpu: hardware.gpu,
            ram: hardware.ram,
            location: ip,
            unique: hardware.unique
          }
        }
      }
    })

    await this.prisma.keys.delete({ where: { id: keyQuery.id } })

    return res.status(201).send({
      statusCode: 201,
      message: 'User created successfully!'
    })
  }
}
