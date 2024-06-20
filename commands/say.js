const utils = require("../services/utils");

/**
 * Command module to handle the !say command, which allows a moderator to speak through the bot.
 * @module !say
 */
module.exports = {
  name: "!say",
  description: "lets a mod talk through the bot",

  /**
   * Executes the !say command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @param {import('discord.js').Client} client - The Discord client instance.
   */
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
