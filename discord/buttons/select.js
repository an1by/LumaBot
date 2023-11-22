const products = require("../../assets/products.json")
const { ModalBuilder, TextInputBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { TextInputStyle, ButtonStyle } = require("discord.js");
const { settingEmbed } = require("../bot");

module.exports = {
    data: {
        name: "select"
    },
    async execute(interaction) {
        const cid = interaction.customId;
        const channel = interaction.channel;
        if (cid.startsWith("select_category:")) {
            let category = cid.split(":")[1];

            await channel.bulkDelete(100, true);

            for (let m of this.category(category))
                await channel.send(m);
        } else if (cid.startsWith("select_product:")) {
            let splitted = cid.split(":");
            let category = splitted[1];
            let product = splitted[2];

            let modal = this.product(category, product);
            await interaction.showModal(modal);
        }
    },
    product(category, product) {
        let modalDataArray = products[category].modal;

        let modal = new ModalBuilder()
            .setCustomId(`processing:${category}:${product}`)
            .setTitle('Оформление заказа');

        for (let i = 0; i < modalDataArray.length; i++) {
            const data = modalDataArray[i];

            const input = new TextInputBuilder()
                .setCustomId('input_' + i)
                .setLabel(data.description)
                .setPlaceholder(data.placeholder)
                .setStyle(i == 0 ? TextInputStyle.Paragraph : TextInputStyle.Short);
            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row)
        }

        return modal;
    },
    categoryEmbed(json) {
        return settingEmbed(new EmbedBuilder()
            .setTitle(json.name)
            .setDescription(json.description.replace("<cost>", json.cost))
            .setImage(json.image))
    },
    category(category) {
        const productJson = products[category].products;

        let array = []
        const back_button = new ButtonBuilder()
            .setLabel("<-")
            .setCustomId("back:create_offer")
            .setStyle(ButtonStyle.Primary);
        for (let key in productJson) {
            let value = productJson[key];

            const select_button = new ButtonBuilder()
                .setLabel("Выбрать")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("select_product:" + category + ":" + key)

            const row = new ActionRowBuilder().addComponents(
                back_button, select_button
            )
            array.push({
                "embeds": [this.categoryEmbed(value)],
                "components": [row]
            })
        }
        return array;
    }
};