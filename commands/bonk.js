export default {
  name: "!bonk",
  description: "Bonks a user's last message",
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

    if (!args[0] || !args[0].startsWith("<@")) return;

    if (args[0].includes("750161264482975805"))
      return msg.react("896163532167610402");

    const userIdString1 = args[0].replace("<@", "");
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
