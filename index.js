require("dotenv").config();
const Discord = require("discord.js");
const bot = new Discord.Client({ partials: ["USER", "REACTION"] });
bot.commands = new Discord.Collection();
const botCommands = require("./commands/");
const url = require("./sources/chanclalibrary");
const bonkService = require("./services/bonkService");
const utils = require("./services/utils");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.emoji.name == "⭐") {
    const hallOfFameChannelId = "837767757784154152";
    const mappedEmojiList = reaction.message.reactions.map(
      (reaction) => reaction
    );

    const justThePushpinEmojis = mappedEmojiList.filter(
      (item) => item._emoji.name == "⭐"
    )[0].count;
    console.log(reaction.message.embeds);
    if (justThePushpinEmojis >= 4) {
      const currentMessageURL = reaction.message.url;
      const previousMessages = await bot.channels
        .get(hallOfFameChannelId)
        .fetchMessages();

      const filteredEmbedsMessages = previousMessages.filter(
        (message) => message.embeds.length > 0
      );

      for (let i = 0; i < filteredEmbedsMessages.length; i++) {
        let messageEmbed = filteredEmbedsMessages[i][0];

        if (messageEmbed.fields[2].value == currentMessageURL) return;
      }

      const randomAdjective = utils.randomAdjective();
      const aOrAn =
        randomAdjective.startsWith("a") ||
        randomAdjective.startsWith("e") ||
        randomAdjective.startsWith("i") ||
        randomAdjective.startsWith("o") ||
        randomAdjective.startsWith("u")
          ? "An"
          : "A";
      const hallOfFameEmbed = new Discord.RichEmbed()
        .setTitle(`⭐HALL OF FAME⭐`)
        .setDescription(
          `${aOrAn} ${randomAdjective} post by ${reaction.message.author}:`
        )
        .addField("Message", reaction.message.content)
        .addField("Channel", reaction.message.channel)
        .addField("Context", reaction.message.url)
        .setTimestamp(reaction.message.createdTimestamp);

      return bot.channels
        .get(hallOfFameChannelId)
        .send(
          hallOfFameEmbed
          //`Congrats! This message was so popular, it's been inducted into the hall of fame!\n\nᵀʰᶦˢ ᵖᵒˢᵗ ʰᵃˢ ⁿᵒᵗ ᵇᵉᵉⁿ ˢᶜʳᵉᵉⁿᵉᵈ ᶠᵒʳ ʰᵉʳᵉˢʸ. ᴹᵃʸ ᴳᵒᵈ ʰᵃᵛᵉ ᵐᵉʳᶜʸ ᵒⁿ ʸᵒᵘʳ ˢᵒᵘˡ.`
        )
        .then(() => reaction.message.react("🥳"))
        .then(() =>
          reaction.message.reply(
            "This message has been added to the hall of fame! May God have mercy on your soul."
          )
        )
        .catch((err) => console.log(err));
    }
  }

  if (reaction.emoji.id == "753418611313344512") {
    const bonkeeId = reaction.message.author.id.toString();

    if (bonkeeId == user.id) return;

    const bonkee = await bonkService.getBonkCount(bonkeeId);

    if (!bonkee) {
      return await bonkService.makeNewUser({
        user_id: bonkeeId,
        bonkCount: 1,
      });
    }

    return await bonkService.updateBonkCount(bonkeeId);
  }
});

bot.on("messageReactionRemove", async (reaction, user) => {
  if (reaction.emoji.id !== "753418611313344512") return;

  const bonkeeId = reaction.message.author.id.toString();

  if (bonkeeId == user.id) return;

  const bonkee = await bonkService.getBonkCount(bonkeeId);

  if (!bonkee) return;

  return await bonkService.minusBonkCountByOne(bonkeeId);
});

bot.on("message", async (msg) => {
  if (msg.author.bot) {
    return;
  }

  const filterWords = ["fuck", "bitch", "cunt", "pussy", "asshole", "nipples"];

  const messageString = msg.content.toLowerCase();
  if (
    msg.author.id == "677700901049466974" &&
    messageString.includes("onion")
  ) {
    msg.react("🧅").catch((error) => console.log(error));
  }

  if (messageString.includes("smite")) {
    msg.reply("Exorcizamus te!");
  }

  if (messageString.includes("get me a beer")) {
    msg.react("🍺").catch((error) => console.log(error));
  }

  if (messageString.includes("thank") && messageString.includes("popebot")) {
    msg.reply("You're welcome, my dude.");
  }

  for (let i = 0; i < filterWords.length; i++) {
    if (messageString.includes(filterWords[i])) {
      msg.reply("This is a Christian minecraft server.");
    }
  }

  if (messageString.includes("heresy") || messageString.includes("heretic")) {
    msg.reply("A heretic? Confess and repent!");
  }

  if (messageString.includes("bread")) {
    msg.react("🍞").catch((error) => console.log(error));
  }

  let args;
  let command;
  let users;

  if (messageString.includes(":chancla:")) {
    let index = Math.floor(Math.random() * 26);
    msg.channel.send(url[index]);
  }

  if (msg.content.startsWith("+")) {
    args = msg.content.split("#");
    command = args.shift().toLowerCase().replace(/\s/g, "").toString();
  }

  if (msg.content.startsWith("!")) {
    args = msg.content.split(" ");
    command = args[0].toLowerCase().toString();
    users = bot.users;
  }

  if (args === undefined) {
    args = msg.content;
    command = args.toLowerCase().replace(/\s/g, "").toString();
  }

  if (!bot.commands.has(command)) {
    return;
  }

  try {
    bot.commands.get(command).execute(msg, args, bot);
  } catch (error) {
    console.error(error);
    msg.reply("Tell Tyler something broke!");
  }
});
