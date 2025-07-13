import utils from "../services/utils.js";

export default {
  name: "!say",
  description: "let's a mod talk through the bot",
  execute(msg, args, client) {
    const authCheck = utils.checkIfUserIsAuthorized(msg);

    if (!authCheck) return;

    const message = msg.content.split(" ").slice(2).join(" ");

    if (args[0].startsWith("<#")) {
      const channelToSendMessageTo = args[0].substring(2, args[0].length - 1);
      return client.channels.cache
        .get(channelToSendMessageTo)
        .send(message)
        .then(async () => {
          await msg.reply("Message sent!")
          await msg.delete()
        })
        .catch((error) => console.log(error));
    }
    else {
        return msg.channel.send("Error, please use the format `!say <#channel_id> message`")
            .catch((error) => console.log(error));
    }
  },
};
