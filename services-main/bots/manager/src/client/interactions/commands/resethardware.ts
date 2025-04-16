import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('resethardware')
    .setDescription('Reset user unique.')
    .addStringOption(option =>
      option.setName('username').setDescription('username').setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const username = interaction.options.get('username')?.value as string

      const userQuery = await prisma.users.findFirst({
        where: { username }
      })

      if (!userQuery) {
        await interaction.reply({
          content: 'User not found!',
          ephemeral: true
        })

        return
      }

      await prisma.identifiers.update({
        where: { userId: userQuery.id },
        data: { unique: 'not set' }
      })

      await interaction.reply({ content: 'Hardware reseted with successfully!', ephemeral: true })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
