require("dotenv").config();
const Discord = require("discord.js");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require("./commands");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", (msg) => {
  if (msg.author.bot) {
    return;
  }
  const args = msg.content.split("#");
  const command = args.shift().toLowerCase().replace(/\s/g, "").toString();

  if (Number(args[1]) > 2865 || Number(args[1] < 1)) {
    msg.reply("Please select a number between 1 and 2865");
  }

  if (!bot.commands.has(command)) {
    return msg.reply("Try saying '+ccc #paragraphnumber'");
  }

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("Tell Tyler something broke!");
  }
});
