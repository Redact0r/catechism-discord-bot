import utils, {CHANNELS} from "../services/utils.js";
import {Colors, Embed, EmbedBuilder} from "discord.js";

export default {
    name: "!say",
    description: "let's a mod talk through the bot",
    async execute(msg, args, client) {
        const authCheck = utils.checkIfUserIsAuthorized(msg);
        const logsChannel = await client.channels.cache.get(CHANNELS.LOGS_CHANNEL_ID);

        if (!authCheck) return;

        const message = msg.content.split(" ").slice(2).join(" ");

        if (args[0].startsWith("<#")) {
            const channelToSendMessageTo = args[0].substring(2, args[0].length - 1);
            await client.channels.cache
                .get(channelToSendMessageTo)
                .send(message)
                .then(async () => {
                    await msg.reply("Message sent!")
                    await msg.delete()
                })
                .catch((error) => console.log(error));
            const embed = new EmbedBuilder()
                .setTitle("Message Content")
                .setDescription(message)
                .setColor(Colors.Blurple)
            await logsChannel.send({
                content: `Message sent by ${msg.author.tag} in <#${channelToSendMessageTo}>`,
                embeds: [
                    embed,
                ]
            });
        } else {
            return msg.channel.send("Error, please use the format `!say <#channel_id> message`")
                .catch((error) => console.log(error));
        }
    },
};
