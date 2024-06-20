/**
 * Command module to handle the !bonk command, which reacts to a user's last message with a "bonk" emoji.
 * @module !bonk
 */
module.exports = {
  name: "!bonk",
  description: "Bonks a user's last message",

  /**
   * Executes the !bonk command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @returns {Promise<void>}
   */
  async execute(msg, args) {
    const officerRole = msg.member.roles.cache.find(
      (role) => role.name == "Sheriff"
    );
    const modRole = msg.member.roles.cache.find(
      (role) => role.name == "Deputy"
    );

    const modRoleTest = msg.member.roles.cache.find(
      (role) => role.name == "Moderator"
    );

    let roleToTestFor;

    if (officerRole) {
      roleToTestFor = officerRole;
    } else {
      roleToTestFor = modRole;
    }

    if (
      !roleToTestFor &&
      msg.author.id !== "289925886424121345" &&
      msg.author.id !== "298190703857500171" &&
      msg.author.id !== "722310139184676865"
    )
      return;

    if (!args[1] || !args[1].startsWith("<@")) return;

    if (args[1].includes("750161264482975805"))
      return msg.react("896163532167610402");

    const userIdString1 = args[1].replace("<@", "");
    const userIdString = userIdString1.replace(">", "");

    if (userIdString === msg.author.id) return;

    const msgs = await msg.channel.messages.fetch();
    const userMsg = msgs.filter((m) => m.author.id === userIdString).first();

    return userMsg
      .react("896163532167610402")
      .then(() => msg.delete())
      .catch((error) => console.log(error));
  },
};
