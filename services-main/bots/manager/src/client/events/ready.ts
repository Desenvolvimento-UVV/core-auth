import { type Client, Events } from 'discord.js'

export default {
  name: Events.ClientReady,
  async execute(client: Client): Promise<void> {
    console.log('bot ready!')
  }
}
