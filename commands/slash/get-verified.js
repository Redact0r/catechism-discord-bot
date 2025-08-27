import {SlashCommandBuilder} from "discord.js";
import {getVerificationInstructions} from "../../services/utils.js";

export default {
    enabledInProd: false,
    data: new SlashCommandBuilder()
        .setName("get-verified")
        .setDescription("Get the verified role")
        .addChannelOption(input =>
            input.setName("channel")
                .setDescription("The channel to send the verification message to")
                .setRequired(true)
        )
        .addUserOption(user =>
            user.setName("user")
                .setDescription("The user to get verified")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.member;
        const channel = interaction.options.getChannel("channel")
        const user = interaction.options.getUser("user")
        await channel.send(getVerificationInstructions(user, user.username))
        await interaction.reply({content: `Verification instructions sent to ${channel}`, ephemeral: true});
    }
}