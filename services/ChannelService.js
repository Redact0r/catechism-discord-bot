import {getVerificationInstructions, sleep} from "./utils.js";
import {Colors, EmbedBuilder} from "discord.js";

export async class ChannelService {
    static async handleVerificationTicketOpen(channel) {
        await sleep(1000 * 5); // Wait for 5 seconds to ensure the channel is fully created
        if (channel.name.startsWith("ticket-")) {
            // the second half of the channel name is the username
            let username = channel.name.split("ticket-")[1];
            // Replace periods with no space
            username = username.replace(/\./g, "");
            const user = channel.members.find(member => member.user.username.replace(/\./g, "") === username.toLowerCase());
            const instructions = getVerificationInstructions(user, username)

            const messages = await channel.messages.fetch({limit: 10});
            const verifyWords = ["verify", "verification", "verified", "verifiy", "verifcation", "verifed", "verfy", "verifiction", "verifiyed", "verifiycation"];
            // Check the second message's embeds for the verification words
            const hasVerificationMessage = messages.some(msg => msg.embeds.some(embed => {
                return embed.fields && verifyWords.some(word => embed.fields.some(field => field.value.toLowerCase().includes(word)))
            }) || msg.content && verifyWords.some(word => msg.content.toLowerCase().includes(word)));

            if (hasVerificationMessage) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle("Verification Instructions")
                    .setDescription(instructions)
                    .setTimestamp(new Date())
                    .setFooter({text: "Please follow the instructions to verify your account."});
                await channel.send({
                    embeds: [embed]
                });
                console.log(`[INFO] Sent verification instructions to ${channel.name}`);
            } else {
                console.log(`[INFO] No verification message found in ${channel.name}`);
            }

        }
    }
}