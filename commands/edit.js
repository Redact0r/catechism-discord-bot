const utils = require("../services/utils");

/**
 * Command module to handle the !edit command, which allows a moderator to edit a message through the bot.
 * @module !edit
 */
module.exports = {
  name: "!edit",
  description: "lets a mod talk through the bot",

  /**
   * Executes the !edit command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @param {import('discord.js').Client} client - The Discord client instance.
   */
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
