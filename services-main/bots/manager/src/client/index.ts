import { type Awaitable, Client, GatewayIntentBits } from 'discord.js'
import * as eventModules from './events'

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
})

export interface EventModule {
  name: string
  execute: (...args: any[]) => Awaitable<void>
}

const events: Record<string, EventModule> = {}

type EventModules = Record<string, { default: EventModule }>

const typedEventModules: EventModules = eventModules

Object.keys(typedEventModules).forEach((key) => {
  const event = typedEventModules[key].default
  events[key] = { name: event.name, execute: event.execute }
})

for (const [name, value] of Object.entries(events)) {
  client.on(name, (...args) => value.execute(...args))
}
