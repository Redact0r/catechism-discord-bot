const {ROLES, checkIfUserIsAuthorized} = require("../services/utils");

module.exports = {
    name: "!quarantine",
    description: "Quarantine a user",
    async execute(msg, args, client) {
        if (!checkIfUserIsAuthorized(msg)) {
            await msg.react("🚫");
            console.log("User is not authorized to use this command");
            console.log("User", msg.author.username);
            console.log("User ID", msg.author.id);
            return;
        }
        if (args.length < 1) {
            await msg.reply("Error, not enough arguments provided. Expected 1 argument, received 0");
            console.log("Error, not enough arguments provided. Expected 1 argument, received", args.length);
            return;
        }

        const userId = args[0].replace(/[<@!>]/g, "");
        const user = msg.guild.members.cache.get(userId);

        if (!user) {
            await msg.reply("Error, user not found.");
            return;
        }

        user.roles.add(ROLES.QUARANTINED)
            .then(async () => {
                await msg.reply(`User ${user.user.username} has been quarantined.`);
            })
            .catch(async err => {
                console.error(err);
                await msg.reply("Error, unable to quarantine user.");
            });
    },
}