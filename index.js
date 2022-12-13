require("dotenv").config();
const { Client, Intents, Collection } = require("discord.js");
const bot = new Client({
  partials: ["USER", "REACTION", "MESSAGE", "CHANNEL", "GUILD_MEMBER"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
bot.commands = new Collection();
const botCommands = require("./commands/");
const utils = require("./services/utils");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;
console.log(TOKEN);

bot
  .login(TOKEN)
  .catch((err) => console.log("Couldn't login. Wrong token?" + "\n" + err));

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageCreate", async (msg) => {
  if (
    msg.channel.id === "905081710734114869" &&
    msg.embeds[0] &&
    msg.embeds[0].author
  ) {
    // console.log(msg.embeds[0]);
    const msgContent = msg.embeds[0].description;
    const strToLookFor1 = "<@&891391330234818660>";
    const strToLookFor2 = "<@&891419366745342012>";
    const msgAuthor = msg.embeds[0].author.name;

    if (
      msgContent.includes(strToLookFor1) &&
      msgContent.includes(strToLookFor2)
    ) {
      msg.channel
        .send(
          `Hey, <@&890984994611265557> and <@&891744347454844978>, @${msgAuthor} changed their sex role!`
        )
        .catch((error) => console.log(error));
    }
  }

  if (msg.author.bot) {
    return;
  }

  if (process.env.TESTMODE && msg.guild.id !== "750160687237431307") {
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
