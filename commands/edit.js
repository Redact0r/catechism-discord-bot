const utils = require("../services/utils");

module.exports = {
  name: "!edit",
  description: "let's a mod talk through the bot",
  execute(msg, args, client) {
    const authCheck = utils.checkIfUserIsAuthorized(msg);

    if (!authCheck) return;

    if (args.length < 3) return;
    const messageID = args[1];
    const messageText = args.splice(2).join(" ");

    if (!isNaN(parseInt(messageID))) {
      msg.channel.messages.fetch(messageID).then((m) => {
        m.edit(messageText).catch((err) => {
          console.error(err);
        });
      });
    }
  },
};
