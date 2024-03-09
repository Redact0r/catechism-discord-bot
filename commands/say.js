const utils = require("../services/utils");

module.exports = {
  name: "!say",
  description: "let's a mod talk through the bot",
  execute(msg, args, client) {
    const authCheck = utils.checkIfUserIsAuthorized(msg);

    if (!authCheck) return;

    const message = args.slice(2).join(" ");

    if (args[1].startsWith("<#")) {
      const channelToSendMessageTo = args[1].substring(2, args[1].length - 1);
      return client.channels.cache
        .get(channelToSendMessageTo)
        .send(message)
        .then(() => msg.delete())
        .catch((error) => console.log(error));
    }
  },
};
