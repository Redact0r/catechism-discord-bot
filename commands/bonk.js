const bonkService = require("../services/bonkService");

function getUserFromMention(mention, users) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }
    return users.get(mention);
  }
}

module.exports = {
  name: "!bonk",
  description: "Bonk someone",
  async execute(msg, args, client) {
    const mention = args[1] == "check" ? args[2] : args[1];
    const user = (await getUserFromMention(mention, client.users)) || null;
    if (!user) return msg.reply("User not found, no bonks applied.");

    if (args[1] == "check") {
      const bonkCount = (await bonkService.getBonkCount(user.id)) || 0;
      return msg.reply(
        `${mention} has been bonked ${bonkCount.bonkCount || bonkCount} times!`
      );
    }

    const lastMessage = (await user.lastMessage) || null;
    const bonkEmoji = await client.emojis.get("753418611313344512");

    if (!lastMessage)
      return msg.reply("I don't think they did anything wrong.");
    if (!bonkEmoji) return;

    if (lastMessage && bonkEmoji) return lastMessage.react(bonkEmoji);
  },
};
