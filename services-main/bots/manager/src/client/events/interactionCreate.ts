import { Events, type GuildMemberRoleManager, type Interaction } from 'discord.js'
import * as commandModules from '../interactions/commands'
import config from '../../config'

const commands = Object(commandModules)

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commands[interaction.commandName].default
        const roles = interaction.member?.roles as GuildMemberRoleManager

        if (!roles.cache.has(config.STAFF_ROLE)) {
          await interaction.reply({
            content: 'This command is for administrators only!',
            ephemeral: true
          })

          return
        }

        command.execute(interaction)
      }
    } catch (e: any) {
      console.log(`Critical error! (${e.message})`)
    }
  }
}
