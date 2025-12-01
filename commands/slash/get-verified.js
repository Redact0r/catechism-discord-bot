import {SlashCommandBuilder} from "discord.js";
import {getVerificationInstructions} from "../../services/utils.js";

export default {
    name: "verify",
    enabledInProd: true,
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verification helper command")
        .addSubcommand(subCommand =>
            subCommand
                .setName("send-instructions")
                .setDescription("Send verification instructions to a channel")
                .addChannelOption(input =>
                    input.setName("channel")
                        .setDescription("The channel to send the verification message to")
                        .setRequired(true)
                )
                .addUserOption(user =>
                    user.setName("user")
                        .setDescription("The user to get verified")
                        .setRequired(true)
                )),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "send-instructions") {
            return await this.sendVerificationInstructions(interaction);
        }
    },
    async sendVerificationInstructions(interaction) {
        const channel = interaction.options.getChannel("channel")
        const user = interaction.options.getUser("user")
        await channel.send(getVerificationInstructions(user, user.username))
        await interaction.reply({content: `Verification instructions sent to ${channel}`, ephemeral: true});
    }
}