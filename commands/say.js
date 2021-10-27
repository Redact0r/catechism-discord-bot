module.exports = {
  name: "!say",
  description: "let's a mod talk through the bot",
  execute(msg, args, client) {
    const officerRole = msg.member.roles.cache.find(
      (role) => role.name == "officers"
    );
    const modRole = msg.member.roles.cache.find((role) => role.name == "Cadet");

    const modRoleTest = msg.member.roles.cache.find(
      (role) => role.name == "Moderator"
    );

    let roleToTestFor;

    if (officerRole) {
      roleToTestFor = officerRole;
    } else {
      roleToTestFor = modRole;
    }

    if (!roleToTestFor && msg.author.id !== "289925886424121345") return;

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
