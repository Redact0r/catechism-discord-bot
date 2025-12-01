import {SlashCommandBuilder, userMention} from "discord.js";
import {
    CHANNELS,
    checkInteractionPermissions,
    ROLES
} from "../../services/utils.js";

export default {
    name: "quarantine",
    enabledInProd: true,
    data: new SlashCommandBuilder()
        .setName("quarantine")
        .setDescription("Quarantine a user")
        .addSubcommand(subCommand =>
            subCommand.setName("add")
                .setDescription("Add a user to quarantine")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to quarantine")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                        .setDescription("Reason for quarantine")
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand.setName("remove")
                .setDescription("Remove a user from quarantine")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to quarantine")
                        .setRequired(true)))
        .setDescription("Remove a user from quarantine"),
    async execute(interaction, client) {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const logsChannel = await interaction.guild.channels.fetch(CHANNELS.LOGS_CHANNEL_ID); // Replace with actual channel ID

        if (!checkInteractionPermissions(interaction, ROLES.SHERIFF, ROLES.DEPUTY, ROLES.WATCHMAN)) {
            await interaction.reply({content: "You do not have permission to use this command.", ephemeral: true});
            console.warn("[WARN] User is not authorized to use this command", interaction.user.username, interaction.user.id);
            return;
        }
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await interaction.reply({content: "Error, user not found."});
            return;
        }

        if (subCommand === "add") {
            try {
                await member.roles.add(ROLES.QUARANTINED); // Replace with actual role ID
                logsChannel.send(`User ${user.username} (${userMention(user.id)}) has been quarantined by ${userMention(interaction.user.id)} for reason: ${reason}`);
                await interaction.reply({content: `User ${userMention(user.id)} has been quarantined.`});
            } catch (err) {
                console.error(err);
                await interaction.reply({content: "Error, unable to quarantine user."});
            }
        } else if (subCommand === "remove") {
            try {
                await member.roles.remove(ROLES.QUARANTINED); // Replace with actual role ID
                logsChannel.send(`User ${user.username} (${userMention(user.id)}) has been removed from quarantine by ${userMention(interaction.user.id)}`);
                await interaction.reply({content: `User ${userMention(user.id)} has been removed from quarantine.`});
            } catch (err) {
                console.error(err);
                await interaction.reply({content: "Error, unable to remove user from quarantine."});
            }
        }
    }
}