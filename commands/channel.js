const {checkIfUserIsAuthorized, ROLES, PROD_LOGS_CHANNEL_ID} = require('../services/utils');
module.exports = {
    name: "!channel",
    description: "Manage channel settings",
    async execute(message, args) {
        const logsChannel = message.guild.channels.cache.get(PROD_LOGS_CHANNEL_ID);
        // Check if the user has permission to manage channels
        const isCommunityManager = message.member.roles.cache.has(ROLES.COMMUNITY_MANAGER);
        if (!checkIfUserIsAuthorized(message) && !isCommunityManager) {
            logsChannel.send("Unauthorized access attempt to !channel command by " + message.author.username);
            return message.reply("You do not have permission to use this command.");
        }
        // subcommands: hide, show
        if (args.length === 0) {
            return message.reply("Please provide a subcommand: `hide` or `show`.");
        }

        // command format: !channel hide|show <#channel>

        const subcommand = args[0].toLowerCase();
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

        if (!channel) {
            return message.reply("Please mention a valid channel or provide a channel ID.");
        }

        if (subcommand === "hide") {
            // Log the action
            logsChannel.send(`Channel ${channel} is being hidden by ${message.author.username}.`);
            // Hide the channel
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                VIEW_CHANNEL: false,
            });
            return message.reply(`Channel ${channel} has been hidden.`);
        } else if (subcommand === "show") {
            // Log the action
            logsChannel.send(`Channel ${channel} is being made visible by ${message.author.username}.`);
            // Show the channel
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                VIEW_CHANNEL: true,
            });
            return message.reply(`Channel ${channel} is now visible.`);
        } else {
            return message.reply("Invalid subcommand. Use `hide` or `show`.");
        }

    }
}