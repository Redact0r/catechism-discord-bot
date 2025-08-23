import {SlashCommandBuilder, userMention} from "discord.js";
import {ROLES} from "../../services/utils.js";

export default {
    enabledInProd: false,
    data: new SlashCommandBuilder()
        .setName("smite")
        .setDescription("Smite a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to smite")
                .setRequired(true)),
    async execute(interaction, client) {
        const user = interaction.options.getUser("user");

        // For now, only verified members can use this command, it's just a fun command
        if (!interaction.member.roles.cache.some(role => role.id === ROLES.VERIFIED_MALE || role.id === ROLES.VERIFIED_FEMALE)) {
            await interaction.reply({content: "You do not have permission to use this command.", ephemeral: true});
        }

        // NOTE: This may become a fun command to grant trusted users the ability to timeout 1 person for an hour per-day
        //   This could also be broken out into a separate "touch grass" command

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await interaction.reply({content: "Error, user not found."});
            return;
        }

        try {
            // await member.timeout(10 * 60 * 1000, "Smited by " + interaction.user.username); // 10 minutes
            // await interaction.reply({content: `User ${user.username} has been smited for 10 minutes.`});
            // Add the dead role to the user and reply 'Excorzimus!'
            await member.roles.add(ROLES.DEAD); // Dead role
            await interaction.reply({content: `Exorcizamus te! ${user.username} ${userMention(user.id)} has been smited.`});
        } catch (err) {
            console.error(err);
            await interaction.reply({content: "Error, unable to smite user."});
        }
    }
}