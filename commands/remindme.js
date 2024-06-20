/**
 * Command module to handle the !remindme command, which allows users to set a reminder.
 * @module !remindme
 */
module.exports = {
  name: "!remindme",
  description: "allows users to set reminder",

  /**
   * Executes the !remindme command.
   * @param {import('discord.js').Message} msg - The message object from Discord.
   * @param {Array<string>} args - The command arguments.
   */
  execute(msg, args) {
    const reminderMessage = args.slice(3).join(" ");

    /**
     * Sends the reminder message as a reply.
     */
    function reminder() {
      msg.reply(`\n **REMINDER** \n ${reminderMessage}`);
    }

    //!remindme "3 hours message"
    //!remindme "2 days message"
    //!remindme date 09/07/2020 12:15AM EST
    if (args.length < 2) {
      return msg.reply(
        "Please reply in the following format:\n\n!remindme 3 hours.\n\nCurrently, you can select seconds, minutes, hours, or days. \n A 'for date feature' will be implemented soon."
      );
    }

    switch (args[2]) {
      case "seconds": {
        let msDelay = args[1] * 1000;
        msg.reply(`Godspeed. I will remind you in ${args[1]} seconds.`);
        setTimeout(reminder, msDelay);
        break;
      }
      case "minutes": {
        let msDelay = args[1] * 60000;
        msg.reply(`Godspeed. I will remind you in ${args[1]} minutes.`);
        setTimeout(reminder, msDelay);
        break;
      }
      case "hours": {
        let msDelay = args[1] * 3600000;
        msg.reply(`Godspeed. I will remind you in ${args[1]} hours.`);
        setTimeout(reminder, msDelay);
        break;
      }
      case "days": {
        let msDelay = args[1] * 86400000;
        msg.reply(`Godspeed. I will remind you in ${args[1]} days.`);
        setTimeout(reminder, msDelay);
        break;
      }
      case "date": {
        msg.reply("this feature is being developed");
        break;
      }
      default: {
        msg.reply(
          "Please reply in the following format: !remindme 3 hours. Currently, you select seconds, minutes, hours, or days."
        );
        break;
      }
    }
  },
};
