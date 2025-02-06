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
    if (args.length < 3) {
      msg.reply(`Error, not enough arguments provided. Expected 3 arguments, received ${args.length}`);
      console.log("Error, not enough arguments provided. Expected 3 arguments, received", args.length);
      return;
    }

    let messageID = args[1];
    if (args[1].startsWith("<#")) {
      // Extract message ID from <#message_id>
      messageID = args[1].substring(2, args[1].length - 1);
    } else {
      messageID = args[1];
    }

    const messageText = args.splice(2).join(" ");

    console.log("Sending message to channel", messageID);
    console.log("Message text", messageText);
    if (!isNaN(parseInt(messageID))) {
      msg.channel.messages.fetch(messageID).then((m) => {
        m.edit(messageText).catch((err) => {
          console.error(err);
        });
      });
    }
  },
};
