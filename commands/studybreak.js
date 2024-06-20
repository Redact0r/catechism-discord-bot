const RolesService = require("../services/RolesService");

/**
 * Command module to handle the !studybreak command, which lets a user take a break from the server by removing all their roles and then replacing them upon their return.
 * @module !studybreak
 */

module.exports = {
  name: "!studybreak",
  description: "lets user 'take a break' from the server by removing all their roles and then replacing them upon their return",

  /**
   * Executes the !studybreak command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   */
  execute(msg, args) {
    //discord_id / roles
    const roles = msg.member.roles.cache;

    /**
     * User object containing the Discord ID and roles.
     * @typedef {Object} User
     * @property {string} discord_id - The Discord ID of the user.
     * @property {import('discord.js').Collection<string, import('discord.js').Role>} roles - The roles of the user.
     */
    const user = {
      discord_id: msg.author.id,
      roles: roles,
    };

    /**
     * Gets the user roles from the RolesService.
     * @type {User|undefined}
     */
    const getUser = RolesService.getUserRoles(user.discord_id);

    if (!getUser) {
      roles.forEach((role) => {
        msg.member.roles.remove(role.id);
      });

      RolesService.postRoles(user);

      return msg.reply("I've saved your roles. Enjoy your break!");
    } else {
      getUser.roles.forEach((role) => {
        const oldRole = msg.guild.roles.cache.find(
          (guildRole) => guildRole.id === role.id
        );
        msg.member.roles.add(oldRole);
      });

      RolesService.deleteUser(user.discord_id);

      return msg.reply("I've restored your roles. Welcome back!");
    }
  },
};
