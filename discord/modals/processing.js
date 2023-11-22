const { Payment } = require("../../payment/payments");
const products = require("../../assets/products.json");

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const { settingEmbed } = require("../bot");

module.exports = {
    data: {
        name: "processing"
    },
    async execute(interaction) {
        const splitted = interaction.customId.split(":");
        const category = splitted[1];
        const prString = splitted[2];
        let product = products[category].products[prString];

        let embed = new EmbedBuilder()
            .setTitle(`Новый заказ! (${product.name})`)
            .setDescription(`Заказчик - <@${interaction.user.id}> (\\@${interaction.user.username})`)

        const fields = Array.from(interaction.fields.fields.values());
        for (let json of fields) {
            let index = Number.parseInt(json.customId.replace("input_", ""));
            let name = products[category].modal[index].description
            let value = json.value;

            embed = embed.addFields({
                name: name,
                value: value,
                inline: true
            })
        }

        const id = uuidv4();
        const payment = new Payment(id, interaction.user.id, category + ":" + prString, product.cost, "Покупка " + product.name, embed.toJSON())

        const channel = interaction.channel;
        const pay_button = new ButtonBuilder()
            .setLabel('Оплатить')
            .setURL(payment.url())
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
            .addComponents(pay_button);
        
        let pay_embed = new EmbedBuilder()
            .setTitle("Все почти готово!")
            .setDescription("Для завершения оформления заказа - оплатите его по ссылке ниже");
        pay_embed = settingEmbed(pay_embed)

        await channel.bulkDelete(100, true);
        await interaction.reply({
            embeds: [pay_embed],
            components: [row]
        });
    }
}