import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
    data: new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('Manage user subscriptions.')
        .addStringOption(option =>
            option.setName('username').setDescription('Username').setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('product')
                .setDescription('Select a product')
                .setRequired(true)
                .addChoices(
                    { name: 'Skript', value: 'Skript' },
                    { name: 'Gosth', value: 'Gosth' },
                    { name: 'Tzx', value: 'Tzx' },
                    { name: 'UniTheft', value: 'UniTheft' },
                    { name: 'Eulen', value: 'Eulen' }
                )
        )
        .addStringOption(option =>
            option
                .setName('expire')
                .setDescription('Select an expiration time')
                .setRequired(true)
                .addChoices(
                    { name: 'Remove', value: '-1' },
                    { name: '30 Days', value: '30' },
                    { name: '60 Days', value: '60' },
                    { name: '90 Days', value: '90' },
                    { name: 'Lifetime', value: '3600' }
                )
        ),

    async execute(interaction: CommandInteraction): Promise<void> {
        try {
            const username = interaction.options.get('username')?.value as string
            const productName = interaction.options.get('product')?.value as string
            const productTime = parseInt(interaction.options.get('expire')?.value as string)

            const userQuery = await prisma.users.findFirst({
                where: { username }
            })

            if (!userQuery) {
                await interaction.reply({
                    content: 'Username not found!',
                    ephemeral: true
                })

                return
            }

            const productQuery = await prisma.products.findFirst({
                where: { name: productName }
            })

            if (!productQuery) {
                await interaction.reply({
                    content: 'Product not found!',
                    ephemeral: true
                })

                return
            }

            const currentTime = BigInt(new Date().getTime())
            const existingSubscription = await prisma.subscriptions.findFirst({
                where: { userId: userQuery.id, productId: productQuery.id },
            })

            if (!existingSubscription && productTime == -1) {
                await interaction.reply({
                    content: 'This user doesnt own this subscription!',
                    ephemeral: true
                })

                return
            } else if (existingSubscription && productTime == -1) {
                await prisma.subscriptions.update({
                    where: { id: existingSubscription.id },
                    data: { expireTime: currentTime }
                })

                await interaction.reply({
                    content: 'Subscription removed with successfully!',
                    ephemeral: true
                })

                return
            }

            let expireTime;
            const newExpireTime = BigInt(productTime * 86400000)

            if (existingSubscription) {
                if (existingSubscription.expireTime > currentTime) {
                    expireTime = existingSubscription.expireTime + newExpireTime
                } else {
                    expireTime = BigInt(currentTime) + newExpireTime
                }

                await prisma.subscriptions.update({
                    where: { id: existingSubscription.id },
                    data: { expireTime },
                })

                await interaction.reply({
                    content: 'User subscription extended with sucessfully!',
                    ephemeral: true
                })

                return
            } else {
                expireTime = BigInt(currentTime) + newExpireTime

                await prisma.subscriptions.create({
                    data: {
                        userId: userQuery.id,
                        productId: productQuery.id,
                        expireTime,
                        productKeys: ["added_by_bot"]
                    },
                })

                await interaction.reply({
                    content: 'User subscription added with sucessfully!',
                    ephemeral: true
                })

                return
            }
        } catch (e) {
            await interaction.reply({ content: 'Critical error!', ephemeral: true })
        }
    }
}
