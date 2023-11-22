module.exports = {
    data: {
        name: "close_offer"
    },
    async execute(interaction) {
        await interaction.channel.delete();
    }
}