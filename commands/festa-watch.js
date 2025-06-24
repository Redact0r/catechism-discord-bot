import {checkIfUserIsAuthorized, festaJuninaHelper, getMessageLink, PROD_LOGS_CHANNEL_ID} from "../services/utils.js";

export default {
    name: "!festa-watch",
    description: "Post festa junina messages in the specified channel",
    async execute(msg, args, client) {
        if (!checkIfUserIsAuthorized(msg)) {
            msg.reply("You are not authorized to use this command.");
            await msg.react("🚫");
            return;
        }
        await msg.react("<a:BlurpleLoadEmoji:1366141437808345108>");

        if (args[0] === "stop") {
            if (!festaJuninaHelper.festaWatchStatus) {
                await msg.reply("Festa Watch is not currently running on this server.");
                return;
            }

            festaJuninaHelper.festaWatchStatus = false;

            const intervalId = festaJuninaHelper.festaIntervalIds.get(msg.guild.id);
            if (intervalId) {
                clearInterval(intervalId);
                festaJuninaHelper.festaIntervalIds.delete(msg.guild.id);
            }

            await msg.reply("Festa Watch has been stopped.");
            return;
        }

        if (festaJuninaHelper.festaWatchStatus) {
            await msg.reply("Festa Watch is already running on this server.");
            return;
        }

        festaJuninaHelper.festaWatchStatus = true;

        let logsChannel = msg.guild.channels.cache.get(PROD_LOGS_CHANNEL_ID);
        if (!logsChannel) {
            msg.reply("Error: Logs channel not found.");
            logsChannel = msg.channel;
        }

        await processQueue(msg);

        const intervalId = setInterval(async () => {
            try {
                await processQueue(msg);
            } catch (error) {
                console.error("Error in Festa Watch interval:", error);
                logsChannel.send(`Error in Festa Watch interval: ${error.message}`);
                await msg.react(`🚨`);
                msg.reply(`An error occurred while processing the Festa Watch queue. Please check the logs.`);
            }
        }, 1000 * 60 * 10); // 10 minutes

        // Store the interval ID in the client for potential future use
        festaJuninaHelper.festaIntervalIds.set(msg.guild.id, intervalId);
    }
}

async function processQueue(msg) {
    const lettersChannelId = "1378420626993451058"; // 'festa-junina-letters' channel
    // const lettersChannelId = "891020332436172821"; // dev channel
    const queueChannelId = "1378633224091205642";

    const logsChannel = msg.guild.channels.cache.get(PROD_LOGS_CHANNEL_ID)
    const lettersChannel = msg.guild.channels.cache.get(lettersChannelId);
    const queueChannel = msg.guild.channels.cache.get(queueChannelId);
    if (!lettersChannel || !queueChannel) {
        msg.reply("Error: Missing letters or queue channel.");
        return;
    }

    const messages = await queueChannel.messages.fetch({ limit: 100 });
    if (messages.size === 0) {
        logsChannel.send("No letters found in the queue channel. Sleeping for 10 minutes...");
        return;
    }
    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    const oldestMessage = sortedMessages.first();
    if (!oldestMessage) {
        logsChannel.send("No letters found in the queue channel. Sleeping for 10 minutes...");
        return;
    }

    // Post the message in the letters channel
    await logsChannel.send(`**Festa Watch**: Posting the oldest letter from the queue channel. ${getMessageLink(oldestMessage)}`);

    try {
        await lettersChannel.send({
            content: `${oldestMessage.content}`,
        });
    } catch (error) {
        console.error("Error sending message to letters channel:", error);
        await logsChannel.send(`Error sending message ${getMessageLink(oldestMessage)} to letters channel. Error: ${error.message} \n\n Message: ${oldestMessage.content}`);
    } finally {
        await logsChannel.send(`**Festa Watch**: Deleting the oldest letter from the queue channel. ${getMessageLink(oldestMessage)}`);
        // Delete the message from the queue after posting it
        try {
            await logsChannel.send(`**Festa Watch**: Logged Message: \n\n ${oldestMessage.content}`);
            await oldestMessage.delete();
        } catch (error) {
            console.error("Error deleting message from queue channel:", error);
            await logsChannel.send(`Error deleting message ${getMessageLink(oldestMessage)} from queue channel. Error: ${error.message}`);
        }

        logsChannel.send("**Festa Watch**: Going back to sleep for 10 minutes...");
    }
}