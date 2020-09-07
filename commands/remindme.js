const { Message } = require("discord.js");

module.exports = {
  name: "!remindme",
  description: "allows users to set reminder",
  execute(msg, args) {
    const reminderMessage = args.slice(3).join(" ");
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
