export default {
    name: "speed-date",
    async execute(message, args) {
        // Add a command to collect the list of males in the waiting room
        // This should output a matrix message with the list of names and which rooms/women they have interacted with
        if (!args[0]) {
            return message.reply("Please provide a valid command argument.");
        }

        if (args[0] === "collect") {
            // Logic to collect
            await message.reply("Collecting data from the waiting room...");
            // Waiting room channel
            const waitingRoomChannel = message.guild.channels.cache.find(channel => channel.name === "waiting-room");
            if (!waitingRoomChannel) {
                return message.reply("Waiting room channel not found.");
            }
            // Fetch users in the waiting room with the role male
            const usersInWaitingRoom = waitingRoomChannel.members.filter(member =>
                member.roles.cache.some(role => role.name === "male")
            );

            if (usersInWaitingRoom.size === 0) {
                return message.reply("No users found in the waiting room")
            }

            // Get all the women in their respective rooms
            const womenRooms = message.guild.channels.cache.filter(channel =>
                channel.name.startsWith("room-") && channel.name.startsWith("date-") && channel.type === "GUILD_TEXT"
            );

            // Get the list of women from the rooms
            const womenInRooms = [];
            for (const room of womenRooms) {
                const women = room.members.filter(member =>
                    member.roles.cache.some(role => role.name === "female")
                )
                womenInRooms.push(women)
            }

            // Create a 2d table message with the list of names
            let matrixMessage = "List"
            matrixMessage += "\n```";
            matrixMessage += "Name\t" + womenInRooms.map(room => room.name).join("\t") + "\n";
            for (const user of usersInWaitingRoom) {
                matrixMessage += user.user.username + "\t";
                for (const item of womenInRooms) {
                    matrixMessage += "❌\t"; // User has not interacted
                }
            }

            matrixMessage += "```";
            return message.channel.send(matrixMessage);
        } else if (args[0] === "status") {
            // Logic to check the status of the speed date
            return message.reply("Checking the status of the speed date...");
        }
    }
}