const products = require("../../assets/products.json")
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders");
const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js");
const { settingEmbed } = require("../bot");

module.exports = {
    data: {
        name: "create_offer"
    },
    async execute(interaction) {
        const user = interaction.user;

        const channelName = user.username;

        const guild = interaction.guild;

        const children = guild.channels.cache.get(process.env.SELECT_CATEGORY).children.cache;
        let channel = await children.find(c => c.name === channelName)
        let content = "Вы уже имеете канал для ваших покупок!"
        if (!channel) {
            channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: process.env.SELECT_CATEGORY,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.CreatePublicThreads,
                            PermissionsBitField.Flags.CreateInstantInvite,
                            PermissionsBitField.Flags.CreatePrivateThreads],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            });
            content = "Канал для ваших покупок создан!"
        }
        await this.send(channel);
        await interaction.reply({
            "ephemeral": true,
            "content": `${content} (<#${channel.id}>)`
        });
    },
    message() {
        let embed = new EmbedBuilder()
            .setTitle("Выбери категорию среди присутствующих")
            .setColor(3093046)
            .setImage("https://i.imgur.com/0puHRsK.png");
        embed = settingEmbed(embed);
        
        let row = new ActionRowBuilder()
        for (let cat_name in products) {
            let cat_value = products[cat_name];

            const button = new ButtonBuilder()
                .setLabel(cat_value.name)
                .setCustomId("select_category:" + cat_name)
                .setStyle(ButtonStyle.Secondary)
            row = row.addComponents(button)
        }

        const close_button = new ButtonBuilder()
            .setLabel("Закрыть")
            .setCustomId("close_offer")
            .setStyle(ButtonStyle.Danger)
        row = row.addComponents(close_button)

        return {
            "embeds": [embed],
            "components": [row]
        }
    },
    async send(channel) {
        await channel.bulkDelete(100, true);

        await channel.send(this.message());
    }
};