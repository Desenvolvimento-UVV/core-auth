import * as fs from 'node:fs'
import { PrismaClient } from '@prisma/client'

async function bootstrap() {
    const prisma = new PrismaClient()
    await prisma.$connect()

    console.log('connected!')

    const data = fs.readFileSync('data.json', 'utf-8')

    if (!data.length) {
        return
    }

    const accounts = JSON.parse(data)

    for (const account of accounts) {
        const username = account.username
        const password = account.password
        const isBanned = account.isBanned
        const productKey = account.registrationKey

        const hasSubscription = (name: String) =>
            account.subscriptions.some((str: String) => str == name)

        const expireDate = account.expireDate['$numberLong']

        if (expireDate < new Date().getTime()) {
            console.log(`${username} will not be migrated, subscription expired.`)
            continue
        }

        if (isBanned) {
            console.log(`${username} will not be migrated, banned.`)
            continue
        }

        console.log(`migrating ${username}...`)

        const document = await prisma.users.create({
            data: {
                username,
                password,
                ban: { create: {} },
                identifier: {
                    create: {
                        cpu: 'not set',
                        gpu: 'not set',
                        ram: 'not set',
                        location: 'not set',
                        unique: 'not set'
                    }
                }
            }
        })

        if (!document) {
            console.log('migration failed!')
            process.exit(1)
        }

        const userId = document.id

        const possibleSubscriptions = [
            { "name": "Skript", "id": 1 },
            { "name": "Gosth", "id": 2 },
            { "name": "Tzx", "id": 3 }
        ]

        for (const possibleSubscription of possibleSubscriptions) {
            if (!hasSubscription(possibleSubscription.name)) {
                continue
            }

            await prisma.subscriptions.create({
                data: {
                    userId,
                    productId: possibleSubscription.id,
                    expireTime: BigInt(Date.now()) + BigInt(3600 * 86400000),
                    productKeys: [productKey]
                }
            })
        }
    }

    console.log('\nfinished!\n')
}

bootstrap()