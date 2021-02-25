require("dotenv").config();
const Discord = require("discord.js");
const bot = new Discord.Client({ partials: ["USER", "REACTION"] });
bot.commands = new Discord.Collection();
const botCommands = require("./commands/");
const url = require("./sources/chanclalibrary");
const bonkService = require("./services/bonkService");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.emoji.id == "753418611313344512") {
    const bonkeeId = reaction.message.author.id.toString();

    const bonkee = await bonkService.getBonkCount(bonkeeId);

    if (!bonkee.bonkCount) {
      return await bonkService.makeNewUser({ user_id: bonkeeId, bonkCount: 1 });
    }

    return await bonkService.updateBonkCount(bonkeeId);
  }
});

bot.on("message", (msg) => {
  if (msg.author.bot) {
    return;
  }

  const filterWords = [
    "fuck",
    "bitch",
    "cunt",
    "dick",
    "pussy",
    "asshole",
    "nipples",
  ];

  const messageString = msg.content.toLowerCase();

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
