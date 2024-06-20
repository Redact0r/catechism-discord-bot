const fetch = require("node-fetch");

/**
 * Command module to handle the !saint command, which provides information about the saint of the day.
 * @module !saint
 */
module.exports = {
  name: "!saint",
  description: "Saint of the day",

  /**
   * Executes the !saint command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   */
  async execute(msg, args) {
    const date = new Date();
    let options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "America/New_York",
    };
    const easternDate = date.toLocaleDateString("en-US", options);
    const dateArray = easternDate.split("/");
    const month = dateArray[0];
    const day = dateArray[1];
    const year = dateArray[2];

    const url = `http://calapi.inadiutorium.cz/api/v0/en/calendars/default/${year}/${month}/${day}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      let celebrations = json.celebrations;
      let celebrationsList = celebrations.map((c) => c.title);
      if (celebrationsList.length === 1) {
        return msg.reply(`Today is ${celebrationsList[0]}.`);
      }
      let feastDays = celebrationsList.slice(1);

      if (feastDays.length === 1) {
        return msg.reply(
          `Today is ${celebrationsList[0]} and we are celebrating the Feast of ${feastDays[0]}`
        );
      }

      if (feastDays.length > 1) {
        let feastArray = feastDays.join(" and ");
        return msg.reply(
          `Today is ${celebrationsList[0]} and we are celebrating the following Feasts: ${feastArray}`
        );
      }
    } catch (error) {
      console.log(error);
      msg.reply("Sorry, something went wrong");
    }
  },
};
