module.exports = {
  name: "!edit",
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

    if (
      !roleToTestFor &&
      msg.author.id !== "289925886424121345" &&
      msg.author.id !== "298190703857500171"
    )
      return;

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
