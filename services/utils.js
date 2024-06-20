const TEST_MODE = process.env.TEST_MODE;

/**
 * Utility module providing various helper functions.
 * @module utils
 */
module.exports = {
  /**
   * Gets a user object from a mention string.
   * @param {string} mention - The mention string to extract the user from.
   * @param {import('discord.js').Collection<string, import('discord.js').User>} users - The collection of users.
   * @returns {import('discord.js').User|undefined} The user object, or undefined if not found.
   */
  getUserFromMention(mention, users) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);

      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }
      return users.get(mention);
    }
  },

  /**
   * Gets a random adjective from a predefined list.
   * @returns {string} A random adjective.
   */
  randomAdjective() {
    const arrayOfAdjectives = [
      "dastardly",
      "notorious",
      "insane",
      "quite yearning",
      "moody",
      "lovely",
      "infamous",
      "mischievous",
      "yearnful",
      "haunting",
      "bonk-deserving",
      "mind-boggling",
      "obtrusive",
      "termagent",
      "witty",
      "courageous",
      "funny",
      "precipitous",
      "pretty gay",
      "heretical",
      "tenacious",
      "sonorous",
      "nearly offensive",
      "superfluous",
      "extravagant",
      "unambiguous",
      "ethereal",
      "potentially lethal",
      "ominous",
      "curmudgeonly",
      "most holy",
      "borderline sinful",
      "concerning",
      "riveting",
      "entertaining",
      "quite nice",
      "horrific",
      "unruly",
      "honorable",
      "wistful",
      "endearing",
      "beguiling",
      "possibly illegal?",
      "mostly harmless",
      "confusing",
      "excessive",
      "not very Catholic",
    ];

    const randomIndex = Math.floor(
      Math.random() * (arrayOfAdjectives.length - 1)
    );

    return arrayOfAdjectives[randomIndex];
  },

  /**
   * Gets the nickname of a user in a guild by their user ID.
   * @param {import('discord.js').Guild} guild - The guild object.
   * @param {string} user_id - The ID of the user.
   * @returns {string} The nickname or username of the user, or "user not found".
   */
  getNickNameFromGuildObjectWithUserId(guild, user_id) {
    let userObj = guild.members.filter((member) => member.user.id == user_id);
    let userMap = userObj.map((user) => user);
    let user = userMap[0].user || "user not found";
    console.log("LINE 2 FIRE", user);
    if (user === "user not found") return user;

    let userName = user.nickname ? user.nickname : user.username;

    return userName;
  },

  /**
   * Checks if a user is authorized based on their roles or ID.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @returns {boolean} True if the user is authorized, false otherwise.
   */
  checkIfUserIsAuthorized(msg) {
    let authorized = false;

    const officerRole = msg.member.roles.cache.find(
      (role) => role.id == "890984994611265557"
    );
    const modRole = msg.member.roles.cache.find(
      (role) => role.id == "891744347454844978"
    );

    const modRoleTest = msg.member.roles.cache.find(
      (role) => role.name == "Moderator"
    );

    if (TEST_MODE && modRoleTest) {
      authorized = true;
    }

    if (officerRole || modRole) {
      authorized = true;
    }

    if (
      msg.author.id == "289925886424121345" ||
      msg.author.id == "298190703857500171"
    ) {
      authorized = true;
    }
    return authorized;
  },
};
