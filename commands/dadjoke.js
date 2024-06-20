const fetch = require("node-fetch");

/**
 * Command module to handle the !dadjoke command, which tells a dad joke.
 * @module !dadjoke
 */
module.exports = {
  name: "!dadjoke",
  description: "Tells a dad joke",

  /**
   * Executes the !dadjoke command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   */
  async execute(msg, args) {
    /**
     * Fetches a dad joke from the icanhazdadjoke API.
     * @returns {Promise<string>} A promise that resolves to a dad joke.
     */
    function getDadJoke() {
      return fetch("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((res) =>
          res.ok ? res.json() : new Error("Something's wrong with the API")
        )
        .then((data) => data["joke"])
        .catch((err) => console.error(err));
    }

    let dadJoke = await getDadJoke();

    return msg.channel.send(dadJoke);
  },
};
