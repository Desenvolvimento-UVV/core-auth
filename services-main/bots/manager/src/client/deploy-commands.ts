import { Routes, REST } from 'discord.js'
import config from '../config'
import * as commandModules from './interactions/commands'

interface Command { default: { data: unknown } }

const commands = []

for (const module of Object.values<Command>(commandModules)) {
  commands.push(module.default.data)
}

new REST({ version: '10' })
  .setToken(config.TOKEN)
  .put(Routes.applicationGuildCommands(config.CLIENT, config.GUILD), { body: commands })
  .then(() => { console.log('Successfully registered application commands.') })
  .catch(console.error)
