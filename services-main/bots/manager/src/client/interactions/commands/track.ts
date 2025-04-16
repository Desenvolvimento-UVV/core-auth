import { type CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('track')
    .setDescription('Track user info.')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type')
        .setRequired(true)
        .addChoices(
          { name: 'UID', value: 'uid' },
          { name: 'Username', value: 'username' },
          { name: 'Unique', value: 'unique' }
        )
    )
    .addStringOption(option =>
      option.setName('value').setDescription('Value').setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const type = interaction.options.get('type')?.value as string
      const value = interaction.options.get('value')?.value as string

      let userQuery;
      if (type === 'uid') {
        userQuery = await prisma.users.findFirst({
          where: { id: parseInt(value) },
          include: { identifier: true, ban: true }
        })
      } else if (type === 'username') {
        userQuery = await prisma.users.findFirst({
          where: { username: value },
          include: { identifier: true, ban: true }
        })
      } else {
        const identifierQuery = await prisma.identifiers.findFirst({
          where: { unique: value }
        })

        if (!identifierQuery) {
          await interaction.reply({
            content: 'User not found!',
            ephemeral: true
          })

          return
        }

        userQuery = await prisma.users.findFirst({
          where: { id: identifierQuery.userId },
          include: { identifier: true, ban: true }
        })
      }

      if (!userQuery) {
        await interaction.reply({
          content: 'User not found!',
          ephemeral: true
        })

        return
      }

      const description = `
            ## Informations

            > **Username**: ${userQuery.username}
            > **Banned**: ${userQuery.ban?.banned ? 'Yes' : 'No'}
            > **Reason**: ${userQuery.ban?.reason === 'not set' ? 'N/A' : userQuery.ban?.reason}
             
            ## Hardware
 
            > **CPU**: ${userQuery.identifier?.cpu}
            > **GPU**: ${userQuery.identifier?.gpu}
            > **RAM**: ${userQuery.identifier?.ram}
            > **Unique**: ${userQuery.identifier?.unique}
            > **IP**: ${userQuery.identifier?.location}  
      `

      const resultEmbed = new EmbedBuilder()
        .setColor(0x2c2d31)
        .setTitle('Services - Track')
        .setDescription(description)

      await interaction.reply({ embeds: [resultEmbed], ephemeral: true })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
