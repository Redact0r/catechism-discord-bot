const utils = require("../services/utils");

module.exports = {
  name: "!edit",
  description: "let's a mod talk through the bot",
  execute(msg, args, client) {
    if (!utils.checkIfUserIsAuthorized(msg)) {
      msg.react("🚫");
      console.log("User is not authorized to use this command");
      console.log("User", msg.author.username);
      console.log("User ID", msg.author.id);
      return
    }
    if (args.length < 2) {
      msg.reply(`Error, not enough arguments provided. Expected 2 arguments, received ${args.length}`);
      console.log("Error, not enough arguments provided. Expected 2 arguments, received", args.length);
      console.log("Arguments", args);
      return;
    }

    let messageID = args[1];
    if (args[0].startsWith("<#")) {
      // Extract message ID from <#message_id>
      messageID = args[0].substring(2, args[0].length - 1);
    } else {
      messageID = args[0];
    }

    const messageText = args.splice(1).join(" ");

    console.log("Sending message to channel:", messageID);
    console.log("Message text:", messageText);
    if (!isNaN(parseInt(messageID))) {
      msg.channel.messages.fetch(messageID).then((m) => {
        m.edit(messageText).catch((err) => {
          console.error(err);
          if (err.status === 404) {
            msg.reply("Error, message not found.");
            msg.reply("This could be because the message was not found or the bot does not have permission to edit the message.");
          } else if (err.status === 403) {
            msg.reply("Error, bot does not have permission to edit the message.");
          }
        });
      });
      msg.delete();
    }
  },
};
