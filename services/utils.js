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
      (role) => role.id == this.ROLES.SHERIFF
    );
    const modRole = msg.member.roles.cache.find(
      (role) => role.id == this.ROLES.DEPUTY
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
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * time should be formatted like Go duration strings
   * https://golang.org/pkg/time/#ParseDuration
   * e.g. 1s, 1m, 1h, 1d
   * @param {string} time
   * @Returns {number} the duration in seconds
  */
  parseDuration: (time) => {
    // Step through duration string and parse the time
    let duration = 0;
    let currentNumber = "";
    let currentUnit = "";
    for (let i = 0; i < time.length; i++) {
      if (isNaN(parseInt(time[i]))) {
        // If we have a number and a unit, add the time to the duration
        currentUnit += time[i];
        if (currentNumber && currentUnit) {
          duration += this.convertToSeconds(currentNumber, currentUnit);
          currentNumber = "";
          currentUnit = "";
        }
      } else {
        currentNumber += time[i];
      }
    }

    return duration;
  },
  convertToSeconds(currentNumber, currentUnit) {
    let seconds = 0;
    switch (currentUnit) {
      case "s":
        seconds = parseInt(currentNumber);
        break;
      case "m":
        seconds = parseInt(currentNumber) * 60;
        break;
      case "h":
        seconds = parseInt(currentNumber) * 60 * 60;
        break;
      case "d":
        seconds = parseInt(currentNumber) * 60 * 60 * 24;
        break;
      default:
        break;
    }
    return seconds;
  }
};
