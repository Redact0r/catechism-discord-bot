import * as fs from "node:fs";
import * as path from "path";
import * as url from "url";
import {Colors, EmbedBuilder, Events, REST, Routes, SlashCommandBuilder, userMention} from "discord.js";
import * as dotenv from "dotenv";
import {Client, GatewayIntentBits, Collection, Partials} from "discord.js";
import {ROLES, sleep, CHANNELS, getVerificationInstructions} from "./services/utils.js";
import {drinkReacts, foodReacts} from "./popebot-reactions.js";
import {popebotReplies} from "./popebot-replies.js";
import {RolesService} from "./services/RolesService.js";
import {bool, cleanEnv, str} from "envalid";
import {ChannelService} from "./services/ChannelService.js";

dotenv.config()

const env = cleanEnv(process.env, {
    TOKEN: str(),
    CLIENT_ID: str(),
    GUILD_ID: str({default: "", requiredWhen: (p) => p.TEST_MODE === true}),
    TEST_MODE: bool({default: false}),
    TESTER_ID: str({default: ""}),
    DELETE_COMMANDS_ON_EXIT: bool({default: false})
})


const TOKEN = env.TOKEN;
const TEST_MODE = env.TEST_MODE
const TESTER_ID = env.TESTER_ID;
const DELETE_COMMANDS_ON_EXIT = env.DELETE_COMMANDS_ON_EXIT
const clientId = env.CLIENT_ID;
const guildId = env.GUILD_ID;
const bot = new Client({
    partials: [Partials.User, Partials.Reaction, Partials.GuildMember, Partials.Message, Partials.Channel],
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates,],
});
bot.commands = new Collection();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const slashCommands = [];

console.debug({TEST_MODE, TESTER_ID});

async function loadCommand(commandsPath, file) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if (command.default && 'enabledInProd' in command.default && !command.default.enabledInProd && !TEST_MODE) {
        console.log(`[DEBUG] Command ${command.default.name} is disabled in production mode.`);
        return;
    }
    if (command.default && 'data' in command.default) {
        // If the command has a data property, it's a slash command
        slashCommands.push(command.default.data.toJSON());
        bot.commands.set(command.default.data.name, command.default);
        return
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

// Add a help slash command
const helpCommand = {
    name: 'help',
    description: 'List all available commands',
    enabledInProd: true,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),
    async execute(interaction, client) {
        const exclamationCommands = client.commands.filter(cmd => {
            return cmd.name && cmd.name?.startsWith('!') || cmd.data?.name?.startsWith('!');
        });
        const plusCommands = client.commands.filter(cmd => {
            return cmd.name && cmd.name?.startsWith('+') || cmd.data?.name?.startsWith('+');
        });
        const slashCommands = client.commands.filter(cmd => {
            return cmd.name && !cmd.name?.startsWith('!') && !cmd.data?.name?.startsWith('!') && !cmd.name?.startsWith('+') && !cmd.data?.name?.startsWith('+');
        });
        const commandList = exclamationCommands.concat(plusCommands, slashCommands).map(command => {
            if (command.name?.startsWith('!') || command.name?.startsWith('+')) {
                return `\`${command.name}\`: ${command?.description || command?.data?.description || 'No description available.'}`;
            }
            return `/${command.name}: ${command?.description || command?.data?.description || 'No description available.'}`;
        }).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription(commandList)
            .setColor(Colors.Blue)
            .setTimestamp();
        await interaction.reply({embeds: [embed], ephemeral: true});
    }
}
slashCommands.push(helpCommand);
bot.commands.set('help', helpCommand);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);
        let data;

        if (!TEST_MODE) {
            // The put method is used to fully refresh all commands in the guild with the current set
            data = await rest.put(Routes.applicationCommands(clientId), {body: slashCommands},);
        } else {
            // The put method is used to fully refresh all commands in the guild with the current set
            data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: slashCommands});
        }
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

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

    if (msg.channelId === CHANNELS.MALE_INTROS || msg.channelId === CHANNELS.FEMALE_INTROS) {
        // Detect if the user has an open ticket channel and notify them that they successfully posted their intro
        const ticketChannel = msg.guild.channels.cache.find(channel => channel.name === `ticket-${msg.author.username.toLowerCase().replace(/\./g, "")}`);
        if (ticketChannel) {
            await ticketChannel.send(`Hello ${userMention(msg.author.id)}, your introduction has been received! Our moderators will review it shortly. Thank you for introducing yourself in ${CHANNELS.mentionable(msg.channelId)}!\n\n Please let us know, in this channel, when you are available for a quick video call to complete your verification. If we don't hear from you in a week, we may have to close your ticket.`);
            console.log(`[INFO] Notified user ${msg.author.username} (${msg.author.id}) in their ticket channel about their intro post.`);
        }
    }
})

bot.on(Events.InteractionCreate, async (interaction) => {
    if (TEST_MODE && interaction.user.id !== TESTER_ID) {
        await interaction.reply("Test mode is enabled. You are not allowed to use this command.");
        console.debug(`[DEBUG] Test mode is enabled. Ignoring interaction from ${interaction.user.tag}`);
        return;
    }

    if (interaction.isCommand()) {
        console.debug("[DEBUG] Interaction is a command", interaction.commandName);
        const command = bot.commands.get(interaction.commandName);
        if (!command) {
            console.log("[DEBUG] Command not found");
            await interaction.reply({
                content: `I don't know that command. Valid commands are: ${bot.commands.map((c) => c.name).join(', ')}`,
                ephemeral: true
            });
            return;
        }

        try {
            await command.execute(interaction, bot);
        } catch (error) {
            console.error(error);
            await interaction.reply("Tell Tyler, Noah, or someone that something broke!");
        }
    }
})

bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    /**
     *
     * @type {import('discord.js').TextChannel}
     */
    const logChannel = newMember.guild.channels.cache.find(channel => channel.id === CHANNELS.LOGS_CHANNEL_ID);
    if (!logChannel) return;

    RolesService.client = bot
    RolesService.guildId = newMember.guild.id;
    await RolesService.handleSexRoleChanges(oldMember, newMember, logChannel);
    // await RolesService.cacheVerifiedMembers(newMember)
})

bot.on(Events.GuildMemberAdd, async (member) => {
    if (member.user.bot) return;

    // Parse member's joined timestamp and compare it to current time, if it is less than 1 week automatically quarrantine them
    const createdAt = member.user.createdAt;
    const now = new Date();
    const diff = now - createdAt;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;

    const logChannel = member.guild.channels.cache.get(CHANNELS.LOGS_CHANNEL_ID)
    if (diff < oneWeek) {
        await member.roles.add(ROLES.QUARANTINED);
        await logChannel.send(`User ${member.user.tag} (${userMention(member.id)}) has been automatically quarantined for joining less than a week ago.`);
        console.log(`[INFO] Quarantined new member ${member.user.tag} (${member.id}) who joined less than a week ago.`);
    }
})

bot.on(Events.ChannelCreate, async (channel) => {
    // Check if the channel has prefix "ticket-"
    // If it does, we want to check if the user has sent a message in the channel
    // If they have, we want to see if the message asks for verification
    // If it does, we want to send a message to the channel giving them instructions
    console.log(`[DEBUG] Channel created: ${channel.name}`);
    await ChannelService.handleVerificationTicketOpen(channel);
})

const exitListener = async (msg) => {
    console.log("Exit signal received:", msg);
    console.log("Bot is shutting down...");
    if (TEST_MODE || DELETE_COMMANDS_ON_EXIT) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: []})
            .catch(console.error);
        await rest.put(Routes.applicationCommands(clientId), {body: []})
            .catch(console.error);
        console.log('Successfully deleted all application commands.')
    }
    process.exit()
}

process.on("SIGINT", exitListener);
process.on("SIGTERM", exitListener);
process.on("SIGQUIT", exitListener);
process.on("SIGHUP", exitListener);

