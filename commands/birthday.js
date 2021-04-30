const { Message } = require("discord.js");
const birthdayService = require("../services/birthdayService");
const utils = require("../services/utils");

async function checkIfUserIsAuthorized(msg) {
  const adminRole = await msg.guild.roles.find(
    (r) => r.id == "640679075064840192"
  );
  const moderatorRole = await msg.guild.roles.find(
    (r) => r.id == "640675028802732052"
  );
  const codeKeeperRole = await msg.guild.roles.find(
    (r) => r.id == "753475465553117254"
  );
  if (
    msg.member.roles.has(adminRole.id) ||
    msg.member.roles.has(moderatorRole.id) ||
    msg.member.roles.has(codeKeeperRole.id)
  )
    return true;
  return false;
}

module.exports = {
  name: "!birthday",
  description: "allows users to store birthdays",
  async execute(msg, args, client) {
    //!birthday set @mention mm dd age
    //@mention, if left out, will set it for the user whom the message belongs to
    //only a moderator can set another user's birthday (@mention)
    //age is optional
    return msg.reply("This command is not available right now.");
    const authorId = msg.author.id;

    if (args[1] != "set")
      return msg.reply(
        "Please respond in the following format:\n```!birthday set mm dd age```\nAge is optional."
      );

    if (args[2].startsWith("<@")) {
      const authorization = await checkIfUserIsAuthorized(msg);
      if (!authorization)
        return msg.reply(
          "Users may only set their own birthday. If you are trying to change your own birthday, there's no need to tag yourself. Please contact a mod for further assistance."
        );
      //if authorization, update the birthday
    }
  },
};

//"Please respond with the following format:\n```!birthday set mm dd age```\nAge is optional."
