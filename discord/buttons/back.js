const {execute, getExecutableFunction} = require("../bot")

module.exports = {
    data: {
        name: "back"
    },
    async execute(interaction) {
        const cid = interaction.customId.replace("back:", "");
        const channel = interaction.channel;

        let func = await getExecutableFunction(cid, "button");
        if (cid === "create_offer") {
            await channel.bulkDelete(100, true);
            let msg = func.message();
            await channel.send(msg);
        } else {
            await execute(interaction, func);
        }
    }
}