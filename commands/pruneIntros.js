const utils = require("../services/utils");

async function checkAndPruneMessage(message, users, logsChannel) {
    // Check if the message is not from a bot
    if (message?.author?.bot) return;
    // Check if the message author is not a member of the server
    const isMember = users.some((user) => user.id === message.author.id);
    if (!isMember) {
        await logsChannel.send(`Pruning message from non-member: ${message.author.username} - ${utils.getMessageLink(message)}`);
        // await message.delete();
    }
}

async function fetchMessages(channel, lastMessageId = null) {
    try {
        const messages = await channel.messages.fetch({ limit: 100, before: lastMessageId });

        if (messages.size === 0) {
            return [];
        }

        const allMessages = messages;
        const lastMessage = messages.last();

        if (lastMessage) {
            return allMessages.concat(await fetchMessages(channel, lastMessage.id));
        }

        return allMessages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

async function pruneMessagesInChannel(channel, loadMsg, users, logsChannel) {
    const messages = await fetchMessages(channel)
    if (!messages || messages.length === 0) {
        loadMsg.edit(`No messages found in <#${channel.id}>`);
        return;
    }
    for (const message of messages.values()) {
        await checkAndPruneMessage(message, users, logsChannel);
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
            const users = client.guilds.cache.get(msg.guild.id).members.cache
            console.log("Users in server", users.length)
            return

            const mLoadMsg = await channel.send("Removing messages from non-members in #introduction-male. <a:BlurpleLoadEmoji:1366141437808345108>");
            channel.send("See logs in <#891742946859311114>")
            await pruneMessagesInChannel(maleIntroChannel, mLoadMsg, users, logsChannel);
            mLoadMsg.edit("Removing messages from non-members in #introduction-male. <:CheckEmoji:1366143203857924116>")

            const fLoadMsg = await channel.send("Removing messages from non-members in #introductions-female. <a:BlurpleLoadEmoji:1366141437808345108>");
            const femaleMessages = await fetchMessages(femaleIntroChannel)
            if (!femaleMessages || femaleMessages.length === 0) {
                fLoadMsg.edit("No messages found in #introductions-female");
                return
            }
            for await (const message of femaleMessages.values()) {
                await checkAndPruneMessage(message, users, logsChannel);
            }
            fLoadMsg.edit("Removing messages from non-members in #introductions-female. <:CheckEmoji:1366143203857924116>")

            msg.reply("Introductions pruned successfully.");
        } catch (error) {
            console.error(error);
            msg.reply("An error occurred while pruning introductions.");
        }
    },
}