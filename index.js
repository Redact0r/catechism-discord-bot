require("dotenv").config();
const { Client, Intents, Collection } = require("discord.js");
const bot = new Client({
  partials: ["USER", "REACTION", "MESSAGE", "CHANNEL", "GUILD_MEMBER"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
bot.commands = new Collection();
const botCommands = require("./commands/");
const {ROLES} = require("./services/utils");

Object.keys(botCommands).map((key) => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;
const TEST_MODE = process.env.TEST_MODE;
const TESTER_ID = process.env.TESTER_ID;

bot
  .login(TOKEN)
  .catch((err) => console.log("Couldn't login. Wrong token?" + "\n" + err));

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageCreate", async (msg) => {
  if (TEST_MODE && msg.author.id !== TESTER_ID) return;

  // Log when a user changes their sex role to the #carl-log channel
  if (
    msg.channel.id === "905081710734114869" &&
    msg.embeds[0] &&
    msg.embeds[0].author
  ) {
    // console.log(msg.embeds[0]);
    const msgContent = msg.embeds[0].description;
    const msgAuthor = msg.embeds[0].author.name;

    if (
      msgContent.includes(ROLES.MALE_MENTIONABLE) &&
      msgContent.includes(ROLES.FEMALE_MENTIONABLE)
    ) {
      msg.channel
        .send(
          `Hey, ${ROLES.SHERIFF_MENTIONABLE} and ${ROLES.DEPUTY_MENTIONABLE}, @${msgAuthor} changed their sex role!`
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

  // Take our list of filtered words and assign to a map for O(n) complexity
  const filterWordsMap = filterWords.map(word => ({ [word]: true }))

  const messageString = msg.content.toLowerCase();

  if (messageString.includes("smite")) {
    msg.channel.send("Exorcizamus te!").catch((error) => console.log(error));
  }

  if (messageString.includes("get me a beer") || messageString.includes("beer me") || (messageString.includes("get") && messageString.includes("a pint"))) {
    msg.react("🍺").catch((error) => console.log(error));
  }

  if (messageString.includes("get") && (messageString.includes("a glass of wine") || messageString.includes("some wine"))) {
    msg.react("🍷").catch((error) => console.log(error))
  }

  if (messageString.includes("get") && (messageString.includes("a glass of whiskey") || messageString.includes("some whiskey") || messageString.includes("a glass of rum") || messageString.includes("some rum"))) {
    msg.react("🥃").catch(err => console.log(err))
  }

  if (messageString.includes("thank") && messageString.includes("popebot")) {
    msg.reply("You're welcome, my dude.").catch((error) => console.log(error));
  }

  if (messageString.includes("no cap") && messageString.includes("popebot")) {
    msg.reply("fr fr").catch((error) => console.log(error));
  }

  if (filterWordsMap[messageString]) {
    msg
      .reply("This is a Christian minecraft server.")
      .catch((error) => console.log(error));
  }

  if (messageString.includes("heresy") || messageString.includes("heretic")) {
    let chanceToSay = Math.floor(Math.random() * 100);

    if (chanceToSay < 50)
      msg.reply("A heretic? Confess and repent!")
        .catch((error) => console.log(error));
  }

  if (messageString.includes("bread")) {
    msg.react("🍞").catch((error) => console.log(error));
  }

  if (messageString.includes(":chancla:")) {
    let index = Math.floor(Math.random() * 26);
    msg.channel.send(url[index]);
  }

  let args;
  let command;
  let users;

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
    console.log("Command not found:", command);
    return;
  }

  try {
    console.log("Command received:", command);
    console.log("Arguments received:", args);
    bot.commands.get(command).execute(msg, args, bot);
  } catch (error) {
    console.error(error);
    msg.reply("Tell Tyler something broke!");
  }
});
