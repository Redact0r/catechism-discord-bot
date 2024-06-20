/**
 * Command module to handle the !vacate command, which makes the bot leave the server.
 * @module !vacate
 */

module.exports = {
  name: "!vacate",
  description: "Leaves the server",
  
  /**
   * Executes the !vacate command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   */
  execute(msg) {
    if (msg.author.id === "298190703857500171") {
      return msg.guild.leave();
    }
  },
};
