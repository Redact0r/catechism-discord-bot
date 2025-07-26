import * as fs from "node:fs";
import * as path from "path";
import * as url from "url";
import {Colors, EmbedBuilder, Events} from "discord.js";
import * as dotenv from "dotenv";

dotenv.config()

import {Client, GatewayIntentBits, Collection, Partials} from "discord.js";
import {ROLES, sleep, CHANNELS} from "./services/utils.js";
import {drinkReacts, foodReacts} from "./popebot-reactions.js";
import {popebotReplies} from "./popebot-replies.js";
import {RolesService} from "./services/RolesService.js";

const TOKEN = process.env.TOKEN;
const TEST_MODE = process.env.TEST_MODE.toLowerCase() === 'true' || process.env.TEST_MODE === '1';
const TESTER_ID = process.env.TESTER_ID;
const bot = new Client({
    partials: [Partials.User, Partials.Reaction, Partials.GuildMember, Partials.Message, Partials.Channel],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
});
bot.commands = new Collection();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

console.debug({TEST_MODE, TESTER_ID});
async function loadCommand(commandsPath, file) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if (command.default && 'enabledInProd' in command.default && !command.default.enabledInProd && !TEST_MODE) {
        console.log(`[DEBUG] Command ${command.default.name} is disabled in production mode.`);
        return;
    }
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (command.default && 'name' in command.default && 'execute' in command.default) {
        bot.commands.set(command.default.name, command.default);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
    }
}

for (const folder of commandFolders) {
    // Check if the folder is a directory
    const folderPath = path.join(foldersPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) {
        // This is a standalone command file, not a folder. Load it
        if (folder.endsWith('.js')) {
            console.log("Loading command file:", folder);
            await loadCommand(foldersPath, folder);
        }
    } else if (fs.statSync(folderPath).isDirectory()) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            await loadCommand(commandsPath, file);
        }
    }
}


bot
    .login(TOKEN)
    .catch((err) => console.log("Couldn't login. Wrong token?" + "\n" + err));

bot.on(Events.ClientReady, async () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    const guild = bot.guilds.cache.find((g) => g.id === "890984994611265556");
    await guild.members.fetch().catch(console.error)
        .then(() => console.info(`Fetched ${guild.members.cache.size} members from ${guild.name}`));
});

function extractArgs(msg) {
    let args, command;
    if (msg.content.startsWith("+")) {
        args = msg.content.split("#");
        command = args.shift().toLowerCase().replace(/\s/g, "").toString();
    }

    if (msg.content.startsWith("!")) {
        console.info("Command received:", msg.content);
        args = msg.content.split(/\s+/);
        command = args.shift().toLowerCase().toString();
    }

    return {args, command};
}

bot.on(Events.MessageCreate, async (msg) => {
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
    if (TEST_MODE && msg.author.id != TESTER_ID) {
        console.debug(`[DEBUG] Test mode is enabled. Ignoring message from ${msg.author.tag}`);
        return;
    }

    if (msg.author.bot) {
        // console.debug(`[DEBUG] Ignoring message from bot: ${msg.author.tag}`);
        return;
    }

    if (process.env.TESTMODE && msg.guild.id !== "750160687237431307") {
        // console.debug(`[DEBUG] Test mode is enabled. Ignoring message from guild: ${msg.guild.name}`);
        return;
    }

    try {
        await drinkReacts(msg)
        await foodReacts(msg);
        await popebotReplies(msg)
    } catch (error) {
        console.error(error);
    }

    // console.debug(`[DEBUG] Message received from ${msg.author.tag} in ${msg.guild.name}: ${msg.content}`);
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
            await msg.reply("Tell Tyler, Noah, or someone that something broke!");
        }
    }
})

bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    /**
     *
     * @type {import('discord.js').TextChannel}
     */
    const logChannel = newMember.guild.channels.cache.find(channel => channel.name === 'carl-log')
    if (!logChannel) return;

    await RolesService.handleSexRoleChanges(oldMember, newMember, logChannel);
})

bot.on(Events.ChannelCreate, async (channel) => {
    // Check if the channel has prefix "ticket-"
    // If it does, we want to check if the user has sent a message in the channel
    // If they have, we want to see if the message asks for verification
    // If it does, we want to send a message to the channel giving them instructions
    console.log(`[DEBUG] Channel created: ${channel.name}`);
    await sleep(1000 * 5); // Wait for 5 seconds to ensure the channel is fully created
    if (channel.name.startsWith("ticket-")) {
        // the second half of the channel name is the username
        let username = channel.name.split("ticket-")[1];
        // Replace periods with no space
        username = username.replace(/\./g, "");
        const user = channel.members.find(member => member.user.username.replace(/\./g, "") === username.toLowerCase());
        const instructions = `Hello ${user ? `<@${user?.user?.id}>` : username},\n\nTo verify your account, please see below:\n
    An intro is required prior to sending any DMs (no need to add a selfie), so please proceed to ${CHANNELS.MALE_INTROS_MENTIONABLE} or ${CHANNELS.FEMALE_INTROS_MENTIONABLE} and write one up. \n\nTo access the opposite sex’s introductions and selfies, you’ll need to be video verified. You may coordinate with a mod or verifier here.\n\n **Sending DMs without an intro is a bannable offense**, so please make sure to follow the rules.\n\nThank you!`;

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
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle("Verification Instructions")
                .setDescription(instructions)
                .setTimestamp(new Date())
                .setFooter({text: "Please follow the instructions to verify your account."});
            await channel.send({
                embeds: [
                    embed
                ]
            });
            console.log(`[INFO] Sent verification instructions to ${channel.name}`);
        } else {
            console.log(`[INFO] No verification message found in ${channel.name}`);
        }

    }
})

