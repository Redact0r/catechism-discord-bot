const data = require("../sources/ccc");

const ccc = data.ccc;

module.exports = {
  name: "+ccc",
  description: "Lookup a paragraph in the catechism",
  execute(msg, args) {
    if (Number(args[0]) > 2865 || Number(args[0] < 1)) {
      return msg.reply("Please select a number between 1 and 2865");
    }
    const arg = args[0].toString();
    const passage = ccc.find((p) => p.id === arg);
    msg.reply("Here's what the Church has to say:");
    return msg.channel.send(
      `> Paragraph: ${passage.id} \n >>> ${passage.text} \n`
    );
  },
};
