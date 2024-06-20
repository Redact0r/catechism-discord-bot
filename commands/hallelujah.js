/**
 * Command module to handle the hallelujah! command, which responds with "Praise be!".
 * @module hallelujah!
 */
module.exports = {
  name: "hallelujah!",
  description: "praise be",

  /**
   * Executes the hallelujah! command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @returns {Promise<import('discord.js').Message>} A promise that resolves to the reply message.
   */
  execute(msg, args) {
    return msg.reply("Praise be!");
  },
};
