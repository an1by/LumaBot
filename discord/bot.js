const fs = require("fs")
const { EmbedBuilder } = require('@discordjs/builders');


const { Collection, Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const { getPayment, isProcessed } = require("../payment/payments");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
	c.user.setPresence({
		activities: [{ name: `aniby.ru`, type: ActivityType.Watching }],
		status: 'dnd'
	});

	init();
	await sendInfo();

	console.log(`Бот ${c.user.tag} запущен!`);
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.guildId != process.env.GUILD_ID) return;

	let type = null;
	if (interaction.isButton()) {
		type = "button";
	} else if (interaction.isModalSubmit()) {
		type = "modal";
	}

	if (!type) return;

	let func = getExecutableFunction(interaction.customId, type);

	await execute(interaction, func);
})

function getExecutableFunction(name, type) {
	let func = null;
	if (type === "button") {
		if (name.startsWith("select"))
			name = "select";
		else if (name.startsWith("back"))
			name = "back";
		func = client.buttons.get(name)
	} else if (type === "modal") {
		if (name.startsWith("processing"))
			name = "processing";
		func = client.modals.get(name)
	}

	return func;
}

async function execute(interaction, func) {
	if (!func)
		return;
	try {
		await func.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing the script!', ephemeral: true });
	}
}

function settingEmbed(input_embed) {
	let counter = 0;
	client.user.presence.activities.forEach(
		(activity) => {
			if (activity.name === "aniby.ru")
				counter++;
		}
	)
	if (counter == 0) {
		input_embed = input_embed.addFields({
			name: "Разработчик",
			value: "https://aniby.ru/",
			inline: false
		})
	}
	return input_embed;
}

async function onPay(payment_id) {
	if (isProcessed(payment_id)) return;
	const payment = getPayment(payment_id);

	if (!payment) return;
	payment.process();

	client.users.fetch(payment.buyer, false).then(user => {
		let embed = new EmbedBuilder()
			.setTitle(payment.comment)
			.setDescription("Заказ принят в обработку!\nОжидайте, пока с вами свяжется команда Luma Studio.");
		embed = settingEmbed(embed);
		user.send({
			embeds: [embed]
		})
	})

	const channel = client.channels.cache.get(process.env.CALLBACK_CHANNEL);
	await channel.send({
		embeds: [payment.embed]
	});
}

function init() {
	//// MODALS
	client.modals = new Collection();
	const modalFolders = fs.readdirSync('./discord/modals');

	const modalFiles = modalFolders.filter(file => file.endsWith('.js'));
	for (const file of modalFiles) {
		const modal = require(`./modals/${file}`);
		client.modals.set(modal.data.name, modal);
	}

	//// BUTTONS
	client.buttons = new Collection();
	const buttonFolders = fs.readdirSync('./discord/buttons');

	const buttonFiles = buttonFolders.filter(file => file.endsWith('.js'));
	for (const file of buttonFiles) {
		const button = require(`./buttons/${file}`);
		client.buttons.set(button.data.name, button);
	}
}

async function sendInfo() {
	const category = client.channels.cache.get(process.env.SELECT_CATEGORY);
	category.children.cache.forEach(async channel => await channel.delete());

	// Info
	const channel = client.channels.cache.get(process.env.INFO_CHANNEL);
	await channel.bulkDelete(100, true);

	const offer_button = new ButtonBuilder()
		.setCustomId('create_offer')
		.setLabel('Заказать')
		.setStyle(ButtonStyle.Success);

	const reviews_button = new ButtonBuilder()
		.setLabel('Отзывы')
		.setURL(`https://discord.com/channels/${process.env.GUILD_ID}/${process.env.REVIEWS_CHANNEL}`)
		.setStyle(ButtonStyle.Link);

	const row = new ActionRowBuilder()
		.addComponents(offer_button, reviews_button);

	let embed = new EmbedBuilder()
		.setTitle("Привет! Я помощник студии **Luma Skins** <:1154067849552351293:1154759819689988198>")
		.setDescription("С моей помощью ты быстро сможешь оформить заказ менее чем за 60 секунд! Выбери действие ниже, чтобы перейти к покупке.")
		.setColor(3093046)
		.setImage("https://i.imgur.com/QdZzy2K.png");
	embed = settingEmbed(embed);
	await channel.send({
		embeds: [embed],
		components: [row]
	});
}

client.login(process.env.BOT_TOKEN);

module.exports = {
	execute, getExecutableFunction, onPay, settingEmbed
}