import {SlashCommandBuilder, userMention} from "discord.js";
import {CHANNELS, PROD_LOGS_CHANNEL_ID, ROLES} from "../../services/utils.js";

export default {
    name: "joey-patrol",
    description: "Joey patrol command",
    data: new SlashCommandBuilder()
        .setName("joey-patrol")
        .setDescription("Allow Joey Patrol members to ban suspected Joey alts")
        .addSubcommand(subcommandGroup =>
            subcommandGroup
                .setName("ban")
                .setDescription("Ban a suspected Joey alt")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to ban")
                        .setRequired(true)
                )
        ),
    async execute(interaction, client) {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const guild = client.guilds.cache.get(interaction.guild.id);
        const logsChannel = await guild.channels.fetch(CHANNELS.LOGS_CHANNEL_ID);
        const bansChannel = await guild.channels.fetch(CHANNELS.BANNED_USERS_CHANNEL);
        await guild.members.fetch(); // Fetch all members to ensure roles are up to date
        const requestingMember = await guild.members.fetch(interaction.user.id);
        if (!requestingMember) {
            await interaction.reply({content: "Error, requesting user not found in guild.", ephemeral: true});
            return;
        }

        if (!requestingMember.roles.cache.some(role => role.id === ROLES.JOEY_PATROL || role.id === ROLES.SHERIFF || role.id === ROLES.DEPUTY)) {
            await interaction.reply({content: "You do not have permission to use this command.", ephemeral: true});
            console.log("User is not authorized to use this command");
            console.log("User", interaction.user.username);
            console.log("User ID", interaction.user.id);
            return;
        }

        if (subCommand === "ban") {
            try {
                const member = await interaction.guild.members.fetch(user.id);
                if (!member) {
                    await interaction.reply({content: "Error, user not found."});
                    return;
                }


                // Verify the member is not staff
                if (member.roles.cache.some(role => role.id === ROLES.JOEY_PATROL || role.id === ROLES.SHERIFF || role.id === ROLES.DEPUTY)) {
                    await logsChannel.send(`User ${userMention(user.id)} (${user.id}) attempted to ban a staff member: ${userMention(member.id)} (${member.id})`);
                    await interaction.reply({content: "You cannot ban a staff member."});
                    return;
                }

                await member.ban({reason: "Suspected Joey alt"});
                const msg = `User ${userMention(user.id)} (${user.id}) has been banned by ${userMention(requestingMember.id)} (${requestingMember.id}) for suspected Joey alt.`
                await logsChannel.send(msg);
                await bansChannel.send(msg);
                await interaction.reply({content: `User ${user.username} has been banned.`});
            } catch (err) {
                console.error(err);
                await logsChannel.send(`Error banning user ${user.username} (${user.id}) by ${requestingMember.user.username} (${requestingMember.id}): ${err.message}`);
                await interaction.reply({content: "Error, unable to ban user."});
            }
        }
    }
}