require("dotenv").config();
const Discord = require("discord.js");
const bot = new Discord.Client({
  partials: ["USER", "REACTION", "MESSAGE", "CHANNEL", "GUILD_MEMBER"],
});
bot.commands = new Discord.Collection();
const botCommands = require("./commands/");
const utils = require("./services/utils");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", async (msg) => {
  if (msg.author.bot) {
    return;
  }

  const filterWords = ["fuck", "bitch", "cunt", "pussy", "asshole", "nipples"];

  const messageString = msg.content.toLowerCase();

  if (messageString.includes("smite")) {
    msg.channel.send("Exorcizamus te!").catch((error) => console.log(error));
  }

  if (messageString.includes("get me a beer")) {
    msg.react("🍺").catch((error) => console.log(error));
  }

  if (messageString.includes("thank") && messageString.includes("popebot")) {
    msg.reply("You're welcome, my dude.").catch((error) => console.log(error));
  }

  if (messageString.includes("no cap") && messageString.includes("popebot")) {
    msg.reply("fr fr").catch((error) => console.log(error));
  }

  for (let i = 0; i < filterWords.length; i++) {
    if (messageString.includes(filterWords[i])) {
      msg
        .reply("This is a Christian minecraft server.")
        .catch((error) => console.log(error));
    }
  }

  if (messageString.includes("heresy") || messageString.includes("heretic")) {
    let chanceToSay = Math.floor(Math.random() * 100);

    if (chanceToSay < 50)
      return msg
        .reply("A heretic? Confess and repent!")
        .catch((error) => console.log(error));
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
