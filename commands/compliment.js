const { default: fetch } = require("node-fetch");

/**
 * Command module to handle the !compliment command, which compliments a user.
 * @module !compliment
 */
module.exports = {
  name: "!compliment",
  description: "Compliments a user",

  /**
   * Executes the !compliment command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   * @returns {Promise<void>}
   */
  async execute(msg, args) {
    /**
     * Fetches a compliment from the Compliment API.
     * @returns {Promise<string>} A promise that resolves to a compliment.
     */
    function getCompliment() {
      return fetch(
        "https://8768zwfurd.execute-api.us-east-1.amazonaws.com/v1/compliments"
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Something went wrong with the Compliment API");
          }
        })
        .then((data) => data)
        .catch((err) => console.error(err));
    }

    let compliment = await getCompliment();

    if (!compliment) {
      return console.error(
        "No compliment found. API issue? This is the raw data from the server: " +
          compliment
      );
    }

    compliment = compliment[0].toUpperCase() + compliment.substring(1);

    if (args[1] && !args[1].startsWith("<@")) {
      return msg.reply("I can't compliment someone who doesn't exist.");
    }

    if (args[1] && args[1].includes("750161264482975805")) {
      return msg.reply("I'm flattered.");
    }

    if (args[1] && args[1].startsWith("<@")) {
      return msg.channel.send(`${args[1]} ${compliment}`);
    }

    return msg.reply(compliment);
  },
};
