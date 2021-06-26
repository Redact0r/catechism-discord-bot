const { default: fetch } = require("node-fetch");

module.exports = {
  name: "!compliment",
  description: "Compliments a user",
  async execute(msg, args) {
    function getCompliment() {
      return fetch("https://complimentr.com/api")
        .then((res) =>
          res.ok ? res.json() : new Error("Something's wrong with the API")
        )
        .then((data) => data["compliment"])
        .catch((err) => console.error(err));
    }

    let compliment = await getCompliment();

    if (!compliment)
      return console.error(
        "No compliment found. API issue? This is the raw data from the server:" +
          compliment
      );

    compliment = compliment[0].toUpperCase() + compliment.substring(1);

    if (args[1] && !args[1].startsWith("<@!"))
      return msg.reply("I can't compliment someone who doesn't exist.");

    if (args[1] && args[1] == "<@!750161264482975805>")
      return msg.reply("I'm flattered.");

    if (args[1] && args[1].startsWith("<@!"))
      return msg.channel.send(`${args[1]} ${compliment}!`);

    return msg.reply(compliment);
  },
};
