import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage user blacklist.')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Select an action')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'Add' },
          { name: 'Remove', value: 'Remove' }
        )
    )
    .addStringOption(option =>
      option
        .setName('level')
        .setDescription('Select a level')
        .setRequired(true)
        .addChoices(
          { name: 'Suspicious', value: 'suspicious' },
          { name: 'Threat', value: 'threat' },
        )
    )
    .addStringOption(option =>
      option.setName('unique').setDescription('unique').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('reason').setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const unique = interaction.options.get('unique')?.value as string
      const description = interaction.options.get('reason')?.value as string
      const action = interaction.options.get('action')?.value as string
      const level = interaction.options.get('level')?.value as string

      const isBlacklisted = await prisma.blacklists.findFirst({
        where: { unique }
      })

      if (action === 'Add' && !isBlacklisted) {
        await prisma.blacklists.create({
          data: { unique, description, level }
        })

        await interaction.reply({
          content: 'Unique added to the blacklist with successfully!',
          ephemeral: true
        })

        return
      } else if (action === 'Remove' && isBlacklisted) {
        await prisma.blacklists.delete({
          where: { unique }
        })

        await interaction.reply({
          content: 'Unique removed from the blacklist with successfully!',
          ephemeral: true
        })

        return
      }

      const message = action === 'Add' ? 'This unique is already in the blacklist!' : 'This unique is not in the blacklist!'

      await interaction.reply({
        content: message,
        ephemeral: true
      })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
