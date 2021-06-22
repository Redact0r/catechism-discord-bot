const Discord = require("discord.js");
const bonkService = require("../services/bonkService");
const utils = require("../services/utils");

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
      const top5 = await bonkService
        .getTop5Bonks()
        .catch((error) => console.log(error));
      let n = 0;
      console.log(
        "top 5",
        top5,
        top5[0].user_id,
        top5[0].bonkCount,
        msg.author.id,
        typeof msg.author.id,
        "top 5 end"
      );

      const guild = client.guilds.get(msg.guild.id);
      let userName = utils.getNickNameFromGuildObjectWithUserId(
        guild,
        msg.author.id
      );
      console.log(userName);
      const top5Embed = new Discord.RichEmbed()
        .setColor("#7851a9")
        .setTitle("Test Bonk Leaderboard")
        .addField(
          `**TOP 5 BONK'D**\n\n
          1. ${utils.getNickNameFromGuildObjectWithUserId(
            guild,
            top5[0].user_id
          )}: ${top5[0].bonkCount}\n
          2. ${utils.getNickNameFromGuildObjectWithUserId(
            guild,
            top5[1].user_id
          )}: ${top5[1].bonkCount}\n
          3. ${utils.getNickNameFromGuildObjectWithUserId(
            guild,
            top5[2].user_id
          )}: ${top5[2].bonkCount}\n
          4. ${utils.getNickNameFromGuildObjectWithUserId(
            guild,
            top5[3].user_id
          )}: ${top5[3].bonkCount}\n
          5. ${utils.getNickNameFromGuildObjectWithUserId(
            guild,
            top5[4].user_id
          )}: ${top5[4].bonkCount}\n`
        );

      try {
        return msg.channel.send(top5Embed);
      } catch (error) {
        console.error(error);
      }
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
