const RolesService = require("../services/RolesService");

module.exports = {
  name: "!studybreak",
  description:
    "lets user 'take a break' from the server by removing all their roles and then replacing them upon their return",
  execute(msg, args) {
    //discord_id / roles
    const roles = msg.member.roles.cache;

    const user = {
      discord_id: msg.author.id,
      roles: roles,
    };

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

      return msg.reply("I've saved your roles. Enjoy your break!");
    }
  },
};
