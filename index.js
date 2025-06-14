require("dotenv").config();
const {Client, Intents, Collection, MessageEmbed} = require("discord.js");
const bot = new Client({
    partials: ["USER", "REACTION", "GUILD_MEMBER", "MESSAGE", "CHANNEL", "GUILD_MEMBERS"],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});
bot.commands = new Collection();
const botCommands = require("./commands/");
const {ROLES, sleep, CHANNELS} = require("./services/utils");
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
        command = args.shift().toLowerCase().toString();
    }

    return {args, command};
}

bot.on("messageCreate", async (msg) => {
    // if (msg.content.startsWith("!")) {
    //     const {args, command} = extractArgs(msg);
    //     if (command === "!debug") {
    //         // Print debug information about the user calling the command
    //         const userInfo = `User: ${msg.author.username} (${msg.author.id})
    //         Joined at: ${msg.member.joinedAt}
    //         Roles: ${msg.member.roles.cache.map(role => role.name).join(", ")}
    //         Role IDs: ${msg.member.roles.cache.map(role => role.id).join(", ")}`;
    //         console.log(userInfo);
    //         // send as an embed
    //         const embed = new MessageEmbed()
    //             .setTitle("Debug Information")
    //             .setDescription(userInfo)
    //             .setColor("#0099ff")
    //             .setTimestamp();
    //         await msg.reply({embeds: [embed]});
    //
    //         return
    //     }
    // }
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

bot.on("channelCreate", async (channel) => {
    // Check if the channel has prefix "ticket-"
    // If it does, we want to check if the user has sent a message in the channel
    // If they have, we want to see if the message asks for verification
    // If it does, we want to send a message to the channel giving them instructions
    await sleep(5000); // Wait for 1 second to ensure the channel is fully created
    if (channel.name.startsWith("ticket-")) {
        // the second half of the channel name is the username
        const username = channel.name.split("ticket-")[1];
        const instructions = `Hello ${username},\n\nTo verify your account, please see below:\n
        For your guidance, an intro is required prior to sending any DMs (no need to add a selfie), so please proceed to ${CHANNELS.MALE_INTROS_MENTIONABLE} or ${CHANNELS.FEMALE_INTROS_MENTIONABLE} and write one up. \n\nTo access the opposite sex’s introductions and selfies, you’ll need to be video verified. You may coordinate with a mod or verifier here for a schedule`;

        const messages = await channel.messages.fetch({limit: 10});
        const verifyWords = ["verify", "verification", "verified", "verifiy", "verifcation", "verifed", "verfy", "verifiction", "verifiyed", "verifiycation"];
        // Check the second message's embeds for the verification words
        const hasVerificationMessage = messages.some(msg =>
            msg.embeds.some(embed => {
                return embed.fields && verifyWords.some(word => embed.fields.some(field => field.value.toLowerCase().includes(word)))
            }) ||
            msg.content && verifyWords.some(word => msg.content.toLowerCase().includes(word))
        );

        if (hasVerificationMessage) {
            await channel.send({
                embeds: [
                    {
                        title: "Verification Instructions",
                        description: instructions,
                        color: "#0099ff",
                        timestamp: new Date(),
                        footer: {
                            text: "Please follow the instructions to verify your account."
                        }
                    }
                ]
            });
            console.log(`Sent verification instructions to ${channel.name}`);
        } else {
            console.log(`No verification message found in ${channel.name}`);
        }

    }
})

