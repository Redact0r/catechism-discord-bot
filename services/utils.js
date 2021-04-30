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
};
