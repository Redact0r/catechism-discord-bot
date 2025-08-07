import {SlashCommandBuilder, userMention} from "discord.js";
import {ROLES} from "../../services/utils.js";

export default {
    data: new SlashCommandBuilder()
        .setName("quarantine")
        .setDescription("Quarantine a user")
        .addSubcommand(subCommand =>
            subCommand.setName("add")
                .setDescription("Add a user to quarantine")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to quarantine")
                        .setRequired(true))
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

        if (!interaction.member.permissions.has("MANAGE_ROLES")) {
            await interaction.reply({content: "You do not have permission to use this command.", ephemeral: true});
            console.log("User is not authorized to use this command");
            console.log("User", interaction.user.username);
            console.log("User ID", interaction.user.id);
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
                await interaction.reply({content: `User ${userMention(user.id)} has been quarantined.`});
            } catch (err) {
                console.error(err);
                await interaction.reply({content: "Error, unable to quarantine user."});
            }
        } else if (subCommand === "remove") {
            try {
                await member.roles.remove(ROLES.QUARANTINED); // Replace with actual role ID
                await interaction.reply({content: `User ${userMention(user.id)} has been removed from quarantine.`});
            } catch (err) {
                console.error(err);
                await interaction.reply({content: "Error, unable to remove user from quarantine."});
            }
        }
    }
}