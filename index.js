require("dotenv").config();
const { Client, Intents, Collection } = require("discord.js");
const bot = new Client({
  partials: ["USER", "REACTION", "MESSAGE", "CHANNEL", "GUILD_MEMBER"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
bot.commands = new Collection();
const botCommands = require("./commands/");
const {ROLES} = require("./services/utils");
const { drinkReacts, foodReacts } = require("./popebot-reactions");
const { popebotReplies } = require("./popebot-replies");

Object.keys(botCommands).map((key) => {
  console.log("Loading command: ", botCommands[key].name);
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

function extractArgs(msg) {
  let args, command;
  if (msg.content.startsWith("+")) {
    args = msg.content.split("#");
    command = args.shift().toLowerCase().replace(/\s/g, "").toString();
  }

  if (msg.content.startsWith("!")) {
    console.info("Command received:", msg.content);
    args = msg.content.split(" ");
    command = args[0].toLowerCase().toString();
  }

  if (args === undefined) {
    args = msg.content;
    command = args.toLowerCase().replace(/\s/g, "").toString();
  }

  return {args, command};
}

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

  try {
    drinkReacts(msg)
    foodReacts(msg);
    popebotReplies(msg)
  } catch (error) {
    console.error(error);
  }

  if (msg.content.startsWith("+") || msg.content.startsWith("!")) {
    const extracted = extractArgs(msg);
    const args = extracted.args;
    const command = extracted.command;


    // if (!bot.commands.has(command)) {
    //   console.log("Command not found");
    //   const validCommandsString = `
    //   I don't know that command.
    //   Valid commands are:
    //   ${bot.commands.map((command) => command.name).join(`,
    //   `)}`;
    //   msg.reply(validCommandsString);
    //   return;
    // }

    try {
      console.log("Command received:", command);
      console.log("Arguments received:", args);
      const c = bot.commands.get(command);

      if (!c) {
        console.log("Command not found");
        return;
      }

      c.execute(msg, args, bot);
    } catch (error) {
      console.error(error);
      msg.reply("Tell Tyler something broke!");
    }
  }
})
