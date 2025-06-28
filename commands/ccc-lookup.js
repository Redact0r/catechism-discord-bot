import {ccc} from "../sources/ccc.js";

export default {
  name: "+ccc",
  description: "Lookup a paragraph in the catechism",
  execute(msg, args) {
    if (
      Number(args[0]) > 2865 ||
      Number(args[0] < 1) ||
      typeof Number(args[0]) !== "number"
    ) {
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
