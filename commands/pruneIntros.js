const utils = require("../services/utils");

export default {
    name: "!pruneIntros",
    description: "Prune intros from the server",
    async execute(msg, args, client) {
        if (!utils.checkIfUserIsAuthorized(msg)) {
            await msg.react("🚫");
            return
        }

        const channel = msg.channel;
        const logsChannel = msg.guild.channels.cache.find(
            (channel) => channel.id === utils.LOGS_CHANNEL_ID
        );

        const maleIntroChannel = msg.guild.channels.cache.find(
            (channel) => channel.name === "introductions-male"
        );
        const femaleIntroChannel = msg.guild.channels.cache.find(
            (channel) => channel.name === "introductions-female"
        );

        if (!maleIntroChannel || !femaleIntroChannel) {
            msg.reply(`Error: Missing ${!maleIntroChannel ? "male" : "female"} introduction channel.`);
            return;
        }

        try {
            channel.send("Removing messages from non-members in #introduction-male.");
            maleIntroChannel.messages.each(async (message) => {
                if (!message.member) {
                    logsChannel.send(`Pruning message from non-member: ${message.author.displayName} - ${utils.getMessageLink(message)}`);
                    // await message.delete();
                }
            })

            channel.send("Removing messages from non-members in #introductions-female.");
            femaleIntroChannel.messages.each(async (message) => {
                if (!message.member) {
                    logsChannel.send(`Pruning message from non-member: ${message.author.displayName} - ${utils.getMessageLink(message)}`);
                    // await message.delete();
                }
            })


            msg.reply("Introductions pruned successfully.");
        } catch (error) {
            console.error(error);
            msg.reply("An error occurred while pruning introductions.");
        }
    },
}