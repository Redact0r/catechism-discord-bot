/**
 * Command module to handle the achoo! command, which blesses the sneezer.
 * @module achoo!
 */
module.exports = {
  name: "achoo!",
  description: "Blesses the sneezer",

  /**
   * Executes the achoo! command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @returns {Promise<import('discord.js').Message>} A promise that resolves to the reply message.
   */
  execute(msg, args) {
    return msg.reply("God bless you.");
  },
};
