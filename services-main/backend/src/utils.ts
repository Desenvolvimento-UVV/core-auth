import config from './config'
import jimp from 'jimp'
import { WebhookClient, EmbedBuilder, AttachmentBuilder } from 'discord.js'

class Utils {
  public formatExpireTime(expireTime: number): string {
    const currentTime = Date.now()
    const difference = expireTime - currentTime

    if (difference <= 0) {
      return 'Expired'
    } else if (difference > 5 * 365 * 24 * 60 * 60 * 1000) {
      return 'Lifetime'
    } else if (difference >= 365 * 24 * 60 * 60 * 1000) {
      const years = Math.floor(difference / (365 * 24 * 60 * 60 * 1000))
      return `${years} ${years === 1 ? 'Year' : 'Years'}`
    } else {
      const days = Math.ceil(difference / (24 * 60 * 60 * 1000))
      return days >= 1 ? `${days} Day${days !== 1 ? 's' : ''}` : 'Today'
    }
  }

  public convertToPng(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      jimp.read(buffer, function (err, image) {
        if (err) {
          reject(err)
        }

        try {
          image.getBufferAsync(jimp.MIME_PNG)
            .then(buffer => resolve(buffer))
            .catch(err => reject(err))
        } catch (e) {
          reject('invalid image!')
        }
      })
    })
  }

  public isValidPngImage(buffer: Buffer): boolean {
    if (buffer.length < 8)
      return false

    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i])
        return false
    }

    return true
  }

  public excludeProperties(obj: any, excludeList: string[]) {
    const filteredObj: any = { ...obj }
    excludeList.forEach((prop) => delete filteredObj[prop])
    return filteredObj
  }

  public getAppVersion(): string {
    return config.VERSION
  }

  public xor(buffer: Buffer): string {
    const result = Buffer.alloc(buffer.length)
    const xorKey = Buffer.from(config.XOR_KEY, 'utf-8')

    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer[i] ^ xorKey[i % xorKey.length]
    }

    return result.toString('base64')
  }

  public testWebhooks(): boolean {
    try {
      const json = JSON.parse(config.WEBHOOKS)

      if (json['open'] && json['security']) {
        return true
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async webHook(webhookType: string, title: string, imageBuffer: Buffer, description: string): Promise<void> {
    if (!this.testWebhooks()) {
      throw new Error('Invalid webhooks!')
    }

    const embed = new EmbedBuilder()
      .setTitle(`Services - ${title}`)
      .setColor(0x2f3136)
      .setTimestamp()
      .setImage('attachment://image.png')
      .setDescription(description)

    const webhooks = JSON.parse(config.WEBHOOKS)
    const image = new AttachmentBuilder(imageBuffer, { name: 'image.png' })
    const client = new WebhookClient({ url: webhooks[webhookType] })
    await client.send({ embeds: [embed], files: [image] })
  }
}

export default new Utils()
