require("dotenv").config();
const {Client, Intents, Collection, MessageEmbed} = require("discord.js");
const bot = new Client({
    partials: ["USER", "REACTION", "GUILD_MEMBER", "MESSAGE", "CHANNEL", "GUILD_MEMBERS"],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});
bot.commands = new Collection();
const botCommands = require("./commands/");
const {ROLES} = require("./services/utils");
const {drinkReacts, foodReacts} = require("./popebot-reactions");
const {popebotReplies} = require("./popebot-replies");
const {handleSexRoleChanges} = require("./services/RolesService");

Object.keys(botCommands).map((key) => {
    console.log("Loading command: ", botCommands[key].name);
    try {
        bot.commands.set(botCommands[key].name, botCommands[key]);
    } catch (error) {
        console.error("Error loading command: ", error);
    }
});

const TOKEN = process.env.TOKEN;
const TEST_MODE = process.env.TEST_MODE;
const TESTER_ID = process.env.TESTER_ID;

bot
    .login(TOKEN)
    .catch((err) => console.log("Couldn't login. Wrong token?" + "\n" + err));

bot.on("ready", async () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    const guild = bot.guilds.cache.find((g) => g.id === "890984994611265556");
    await guild.members.fetch().catch(console.error);
});

function extractArgs(msg) {
    let args, command;
    if (msg.content.startsWith("+")) {
        args = msg.content.split("#");
        command = args.shift().toLowerCase().replace(/\s/g, "").toString();
    }

    if (msg.content.startsWith("!")) {
        console.info("Command received:", msg.content);
        args = msg.content.split(" ");
        command = args[0].toLowerCase().toString();
    }

    // Remove the command from the args array
    args.shift()

    return {args, command};
}

bot.on("messageCreate", async (msg) => {
    if (TEST_MODE && msg.author.id !== TESTER_ID) return;

    if (msg.author.bot) {
        return;
    }

    if (process.env.TESTMODE && msg.guild.id !== "750160687237431307") {
        return;
    }

    try {
        await drinkReacts(msg)
        await foodReacts(msg);
        await popebotReplies(msg)
    } catch (error) {
        console.error(error);
    }

    if (msg.content.startsWith("+") || msg.content.startsWith("!")) {
        const {args, command} = extractArgs(msg);

        // if (!bot.commands.has(command)) {
        //   console.log("Command not found");
        //   const validCommandsString = `
        //   I don't know that command.
        //   Valid commands are:
        //   ${bot.commands.map((command) => command.name).join(`,
        //   `)}`;
        //   msg.reply(validCommandsString);
        //   return;
        // }

        try {
            console.log("Command received:", command);
            console.log("Arguments received:", args);
            const c = bot.commands.get(command);

            if (!c) {
                console.log("Command not found");
                return;
            }

            c.execute(msg, args, bot);
        } catch (error) {
            console.error(error);
            msg.reply("Tell Tyler something broke!");
        }
    }
})

bot.on("guildMemberUpdate", async (oldMember, newMember) => {
    /**
     *
     * @type {import('discord.js').TextChannel}
     */
    const logChannel = newMember.guild.channels.cache.find(channel => channel.name === 'carl-log')
    if (!logChannel) return;

    await handleSexRoleChanges(oldMember, newMember, logChannel);
})
