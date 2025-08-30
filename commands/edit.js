import utils from "../services/utils.js";

export default {
    name: "!edit",
    description: "let's a mod talk through the bot",
    async execute(msg, args, client) {
        if (!utils.checkIfUserIsAuthorized(msg)) {
            msg.react("🚫");
            console.debug("[DEBUG] User is not authorized to use this command");
            console.debug("[DEBUG] User", msg.author.username);
            console.debug("[DEBUG] User ID", msg.author.id);
            return
        }
        if (args.length < 3) {
            msg.reply(`Error, not enough arguments provided. Expected 2 arguments, received ${args.length}`);
            console.error("[ERROR] Error, not enough arguments provided. Expected 2 arguments, received", args.length);
            console.debug("[DEBUG] Arguments", args);
            return;
        }

        let channelID = args.shift();
        if (channelID.startsWith("<#")) {
            // Extract channel ID from <#channel_id>
            channelID = channelID.substring(2, channelID.length - 1);
        } else {
            // If the first argument is not a mention, it should be a channel ID
            if (isNaN(parseInt(channelID))) {
                msg.reply("Error, first argument must be a channel ID or a mention.");
                console.error("[ERROR] Error, first argument must be a channel ID or a mention.");
                return;
            }
        }

        let messageID = args.shift();
        if (messageID.startsWith("<#")) {
            // Extract message ID from <#message_id>
            messageID = messageID.substring(2, messageID.length - 1);
        } else {
            // If the second argument is not a mention, it should be a message ID
            if (isNaN(parseInt(messageID))) {
                msg.reply("Error, second argument must be a message ID or a mention.");
                console.error("[ERROR] Error, second argument must be a message ID or a mention.");
                return;
            }
        }

        const messageText = ((text) => {
            const splitText = text.split(" ", 3).join(" ")
            console.debug(`[DEBUG] Split text: ${splitText}`);
            return text.substring(splitText.length);
        })(msg.content)

        console.debug("[DEBUG] Sending message to channel:", messageID);
        console.debug("[DEBUG] Message text:", messageText);
        const channel = client.channels.cache.get(channelID);
        if (!channel) {
            msg.reply("Error, channel not found.");
            console.error("[ERROR] Error, channel not found. Channel ID:", channelID);
            return;
        }

        const message = await channel.messages.fetch(messageID)
        message.edit(messageText).catch((err) => {
            console.error(err);
            if (err.status === 404) {
                msg.reply("Error, message not found.");
                msg.reply("This could be because the message was not found or the bot does not have permission to edit the message.");
            } else if (err.status === 403) {
                msg.reply("Error, bot does not have permission to edit the message.");
            }
        });
        msg.react("✅");
    }
};
