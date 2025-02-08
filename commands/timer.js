
module.exports = {
    name: "!timer",
    description: "Set a timer",
    execute(msg, args) {
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
        for (let i = time; i > 0; i--) {
            setTimeout(() => {
                msg.channel(channel).send("Time left: " + i + " seconds");
            }, i * 1000);
        }

        // After the timer is done, send a message to the channel
        msg.channel(channel).send("Timer is done!");
    }
}