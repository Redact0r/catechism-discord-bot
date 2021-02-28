const Discord = require("discord.js");
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
    const mention = args[1] == "check" || args[1] == "rank" ? args[2] : args[1];

    if (args[1] == "rank") {
      const top5 = await bonkService.getTop5Bonks();
      let n = 0;
      const top5Embed = new Discord.RichEmbed()
        .setColor("#7851a9")
        .setTitle("Bonk Leaderboard")
        .addFields([
          {
            name: "Top 5 Bonk'd!",
            value: top5.map((bonkedUser) => {
              `${n++}. ${bonkedUser.used_id} ${bonkedUser.bonkCount}\n`;
            }),
          },
        ]);

      return msg.send(top5Embed);
    }

    const user = (await getUserFromMention(mention, client.users)) || null;
    if (!user) return msg.reply("User not found, no bonks applied.");

    if (args[1] == "check") {
      const bonkCount = (await bonkService.getBonkCount(user.id)) || 0;
      const count = bonkCount.bonkCount ? bonkCount.bonkCount : bonkCount;
      return msg.reply(`${mention} has been bonked ${count} times!`);
    }

    const lastMessage = (await user.lastMessage) || null;
    const bonkEmoji = await client.emojis.get("753418611313344512");

    if (!lastMessage)
      return msg.reply("I don't think they did anything wrong.");
    if (!bonkEmoji) return;

    if (lastMessage && bonkEmoji) return lastMessage.react(bonkEmoji);
  },
};
