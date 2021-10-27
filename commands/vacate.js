module.exports = {
  name: "!vacate",
  description: "Leaves the server",
  execute(msg) {
    if (msg.author.id == "298190703857500171") {
      return msg.guild.leave();
    }
  },
};
