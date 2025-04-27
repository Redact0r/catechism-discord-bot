const utils = require("../services/utils");

function checkAndPruneMessage(message, users, logsChannel) {
    // Check if the message is not from a bot
    console.log(message.author)
    console.log(message.author.id)
    if (message.author.bot) return;
    // Check if the message author is not a member of the server
    if (!users.find((user) => user.id === message.author?.id)) {
        logsChannel.send(`Pruning message from non-member: ${message.author.username} - ${utils.getMessageLink(message)}`);
        // message.delete();
    }
}

module.exports = {
    name: "!prune-intros",
    description: "Prune intros from the server",
    execute: async (msg, args, client) => {
        if (!utils.checkIfUserIsAuthorized(msg)) {
            msg.reply("You are not authorized to use this command.");
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
            const users = msg.guild.members.cache

            const mLoadMsg = await channel.send("Removing messages from non-members in #introduction-male. <a:BlurpleLoadEmoji:1366141437808345108>");
            channel.send("See logs in <#891742946859311114>")
            const maleMessages = await maleIntroChannel.messages.fetch()
            for (const message of maleMessages) {
                checkAndPruneMessage(message, users, logsChannel);
            }
            mLoadMsg.edit("Removing messages from non-members in #introduction-male. <:CheckEmoji:1366143203857924116>")

            const fLoadMsg = await channel.send("Removing messages from non-members in #introductions-female. <a:BlurpleLoadEmoji:1366141437808345108>");
            const femaleMessages = await femaleIntroChannel.messages.fetch()
            for (const message of femaleMessages) {
                checkAndPruneMessage(message, users, logsChannel);
            }
            fLoadMsg.edit("Removing messages from non-members in #introductions-female. <:CheckEmoji:1366143203857924116>")

            msg.reply("Introductions pruned successfully.");
        } catch (error) {
            console.error(error);
            msg.reply("An error occurred while pruning introductions.");
        }
    },
}