const util = require("node:util");
const {sleep} = require("../services/utils");

module.exports = {
    name: "!chantimer",
    description: "Set a timer",
    execute: async (msg, args, client) => {
        if (args.length < 3) {
            msg.reply("Error, not enough arguments provided. Expected 2 arguments, received " + args.length);
            console.log("Error, not enough arguments provided. Expected 2 arguments, received", args.length);
            console.log("Arguments", args);
            return;
        }

        if (!args[1].startsWith('<#')) {
            msg.reply("Error, expected a channel argument");
            console.log("Error, expected a channel argument");
            console.log("Arguments", args);
            return
        }
        const channel = args[1].substring(2, args[1].length - 1);
        const channelToSendTo = client.channels.cache.get(channel);

        if (!channelToSendTo) {
            msg.reply("Error, channel not found");
            console.log("Error, channel not found");
            console.log("Arguments", args);
            return;
        }

        const time = args[2];
        if (isNaN(time)) {
            msg.reply("Error, expected a number of seconds for the time argument");
            console.log("Error, expected a number for the time argument");
            console.log("Arguments", args);
            return;
        }

        console.log("Setting a timer for", time, "seconds");

        msg.reply("Timer set for " + time + " seconds");

        // Update the message text every second with the remaining time left
        const m = await channelToSendTo.send("Time left: " + time + " seconds");
        const msgToEdit = await channelToSendTo.messages.fetch(m.id)
        for (let i = time; i > 0; i--) {
            await sleep(1000);
            await msgToEdit.edit("Time left: " + i + " seconds");
        }

        // After the timer is done, send a message to the channel
        msgToEdit.edit("Time's up!").catch((error) => console.log(error));

    }
}