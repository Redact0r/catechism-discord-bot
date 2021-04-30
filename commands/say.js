module.exports = {
  name: "!say",
  description: "praise be",
  execute(msg, args, client) {
    console.log(args);
    console.log(msg.author.id);
    const message = args.slice(2).join(" ");
    if (
      msg.author.id == "104268884969807872" ||
      msg.author.id == "298190703857500171" ||
      msg.author.id == "81917243465670656"
    ) {
      if (args[1].startsWith("<#")) {
        const channelToSendMessageTo = args[1].substring(2, args[1].length - 1);
        client.channels
          .get(channelToSendMessageTo)
          .send(message)
          .then(() => msg.delete())
          .catch((error) => console.log(error));
      }
    }
  },
};
