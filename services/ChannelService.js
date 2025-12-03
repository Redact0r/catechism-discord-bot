import {CHANNELS, getVerificationInstructions, ROLES, sleep} from "./utils.js";
import {Colors, EmbedBuilder, userMention} from "discord.js";

export class ChannelService {
    static async handleVerificationTicketOpen(channel, client) {
        await sleep(1000 * 5); // Wait for 5 seconds to ensure the channel is fully created
        if (channel.name.startsWith("ticket-")) {
            // the second half of the channel name is the username
            let username = channel.name.split("ticket-")[1];
            // Replace periods with no space
            username = username.replace(/\./g, "");
            /**
             * @type {import("discord.js").GuildMember}
             */
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
                console.log(`[INFO] Checking if intro already sent for user ${user.user.tag} (${user.id})`);
                const {introSent, introChannel} = await ChannelService.checkIntroAlreadySent(client, user);
                if (introSent) {
                    console.log(`[INFO] Intro already sent for user ${user.user.tag} (${user.id})`);
                    const embed = new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle("Introduction Received")
                        .setDescription(`Hello ${userMention(user.id)}, your introduction has been received! Our moderators will review it shortly. Thank you for introducing yourself in ${CHANNELS.mentionable(introChannel.id)}!`)
                        .addFields({
                            name: "Next Steps",
                            value: "Please let us know, in this channel, a few times you are available to complete verification via a quick video call. If we don't hear from you in a week, we may have to close your ticket."
                        })
                        .setTimestamp();
                    await channel.send({embeds: [embed]});
                } else {
                    console.log(`[INFO] Intro not sent yet for user ${user.user.tag} (${user.id})`);
                }
            } else {
                console.log(`[INFO] No verification message found in ${channel.name}`);
            }

        }
    }

    /**
     *
     * @param client {import("discord.js").Client}
     * @param author {import("discord.js").GuildMember}
     * @returns {Promise<{introSent: boolean, introChannel: import("discord.js").Channel}|boolean>}
     * @private
     */
    static async checkIntroAlreadySent(client, author) {
        if (!author) return false;

        const authorRoles = author.roles.cache;
        /**
         * @type {import("discord.js").Channel}
         */
        let introChannel;
        if (authorRoles.has(ROLES.MALE)) {
            introChannel = await client.channels.fetch(CHANNELS.MALE_INTROS);
        } else if (authorRoles.has(ROLES.FEMALE)) {
            introChannel = await client.channels.fetch(CHANNELS.FEMALE_INTROS);
        }
        const messages = await introChannel.messages.fetch({limit: 100});
        return {introSent: messages.some(msg => msg.author.id === author.id), introChannel};
    }
}