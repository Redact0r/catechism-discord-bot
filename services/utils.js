const TEST_MODE = process.env.TEST_MODE;

module.exports = {
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

  ROLES: {
    FEMALE: "891419366745342012",
    FEMALE_MENTIONABLE: "<@&891419366745342012>",
    MALE: "891391330234818660",
    MALE_MENTIONABLE: "<@&891391330234818660>",
    SHERIFF: "890984994611265557",
    SHERIFF_MENTIONABLE: "<@&890984994611265557>",
    DEPUTY: "891744347454844978",
    DEPUTY_MENTIONABLE: "<@&891744347454844978>",
  },

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

  getNickNameFromGuildObjectWithUserId(guild, user_id) {
    let userObj = guild.members.filter((member) => member.user.id == user_id);
    let userMap = userObj.map((user) => user);
    let user = userMap[0].user || "user not found";
    console.log("LINE 2 FIRE", user);
    if (user === "user not found") return user;

    let userName = user.nickname ? user.nickname : user.username;

    return userName;
  },

  checkIfUserIsAuthorized(msg) {
    let authorized = false;

    const officerRole = msg.member.roles.cache.find(
      (role) => role.id == ROLES.SHERIFF
    );
    const modRole = msg.member.roles.cache.find(
      (role) => role.id == ROLES.DEPUTY
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
