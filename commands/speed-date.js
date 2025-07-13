import {ROLES, speedDateHelper} from "../services/utils.js";
import {writeFileSync} from "fs";
import channel from "./channel.js";
import got from "got";

const WAITING_ROOM_CHANNEL_ID = "1393591760260825199"

export default {
    name: "!speed-date",
    async outputTableToChat(womenRooms, message) {
        // Create a matrix message with the list of names
        let matrixMessage = "**Speed Date Status**\n";
        const roomNames = womenRooms.map(room => room.name);
        matrixMessage += "```\n";

        // Header row
        matrixMessage += "| User         | " + roomNames.map(r => r.padEnd(8)).join(" | ") + "|\n";
        matrixMessage += "-".repeat(15 + roomNames.length * 10) + "\n";

        // Rows for each male
        for (const male of speedDateHelper.maleStatusList) {
            matrixMessage += "| " + male.username.padEnd(12) + " | ";
            matrixMessage += male.rooms.map(room => room.visited ? "✅".padEnd(7) : "❌".padEnd(7)).join(" | ");
            matrixMessage += "|\n";
        }

        matrixMessage += "```";

        await message.channel.send(matrixMessage);
    }, getWomensRooms(message) {
        // Get all the women in their respective rooms
        let womenRooms = message.guild.channels.cache.filter(channel => {
            // console.debug(`[DEBUG] Checking channel: ${channel.name}, isVoiceBased: ${channel.isVoiceBased()}`);
            return channel.isVoiceBased() && channel.name.startsWith("room-") || channel.name.startsWith("date-")
        });

        return womenRooms.sort((a, b) => {
            const numA = a.name.split("-").pop();
            const numB = b.name.split("-").pop();
            return parseInt(numA) - parseInt(numB);
        });
    }, async execute(message, args, client) {
        // Add a command to collect the list of males in the waiting room
        // This should output a matrix message with the list of names and which rooms/women they have interacted with
        if (!args[0]) {
            return message.reply("Please provide a valid command argument.");
        }

        // TODO: Add a command to set up all the rooms based on the number
        //  of women in the waiting room

        if (args[0] === "collect") {

            if (args[1] && URL.parse(args[1]).hostname.includes("discord.com")) {
                // This is probably a link to a message so that we can recover from a backup
                await message.channel.send("Recovering from backup...");
                const g = await client.guilds.fetch(message.guild.id)
                const channelId = args[1].split("/").slice(-2, -1);
                const channel = await g.channels.fetch(channelId);
                const m = await channel.messages.fetch(args[1].split("/").pop());

                const backupData = m.attachments.find(attachment => attachment.name.endsWith('.bak') || attachment.name.endsWith('.json'));
                if (!backupData) {
                    return message.reply("No backup data found in the message.");
                }
                console.debug(`[DEBUG] Backup data found:`, backupData);
                const backupContentUrl = await backupData.url;
                console.debug(`[DEBUG] Backup content URL:`, backupContentUrl);
                const backupContent = await got(backupContentUrl).text();
                console.debug(`[DEBUG] Backup content:`, backupContent);

                // Parse the backup content
                try {
                    const backupJson = JSON.parse(backupContent);
                    console.debug(`[DEBUG] Backup JSON:`, backupJson);
                    // Update the maleStatusList with the backup data
                    speedDateHelper.maleStatusList = backupJson;
                    console.debug(`[DEBUG] Updated maleStatusList from backup:`, speedDateHelper.maleStatusList);
                    await message.reply("Successfully recovered from backup.");
                } catch (error) {
                    await message.reply("Failed to parse backup data. Please ensure it is a valid JSON file.");
                }

                const womensRooms = this.getWomensRooms(message);
                // Send the matrix message to the chat
                await this.outputTableToChat(womensRooms, message);
                return
            }

            // Logic to collect
            await message.reply("Collecting data from the waiting room...");
            // Waiting room channel
            const waitingRoomChannel = await message.guild.channels.fetch(WAITING_ROOM_CHANNEL_ID);
            if (!waitingRoomChannel) {
                return message.reply("Waiting room channel not found.");
            }
            console.debug(`[DEBUG] Waiting room channel: ${waitingRoomChannel.name}`);
            console.debug(`[DEBUG] Waiting room channel is voice based: ${waitingRoomChannel.isVoiceBased()}`);
            // Fetch users in the waiting room with the role male
            const usersInWaitingRoom = waitingRoomChannel.members.filter(member =>
                member.roles.cache.some(role => role.id === ROLES.MALE)
            );

            if (usersInWaitingRoom.size === 0) {
                return message.reply("No users found in the waiting room")
            }

            let womenRooms = this.getWomensRooms(message);
            const visitedRooms = womenRooms.map(room => ({
                roomName: room.name,
                visited: false // Initially set to false, can be updated later
            }));
            // console.debug(`[DEBUG] Found speed date rooms`, womenRooms);

            console.debug(`[DEBUG] Users currently in list:`, speedDateHelper.maleStatusList);
            if (speedDateHelper.maleStatusList.length > 0) {
                // Make sure we append any new members to the existing list
                // First, find the new users in the waiting room
                const existingUsernames = new Set(speedDateHelper.maleStatusList.map(user => user.username));
                console.debug(`[DEBUG] Existing usernames:`, existingUsernames);
                const newUsersInWaitingRoom = usersInWaitingRoom.filter(user => !existingUsernames.has(user.user.username));
                console.debug(`[DEBUG] New users in waiting room:`, newUsersInWaitingRoom);
                // If there are new users, add them to the list
                if (newUsersInWaitingRoom.size === 0) {
                    return message.reply("No new users found in the waiting room");
                }
                console.debug(`[DEBUG] Adding new users to the list:`, newUsersInWaitingRoom);
                // Iterate through the users in the waiting room
                // and add them to the maleStatusList if they are not already present
                speedDateHelper.maleStatusList.push(...newUsersInWaitingRoom.map(male => {
                    return {
                        username: male.user.username,
                        rooms: visitedRooms
                    }
                }));
            } else {
                speedDateHelper.maleStatusList = usersInWaitingRoom.map(male => {
                    return {
                        username: male.user.username,
                        rooms: visitedRooms
                    };
                });
            }


            console.debug(speedDateHelper.maleStatusList);

            await this.outputTableToChat(womenRooms, message);

            // Save the current status to a JSON file and upload it to the channel as a .bak file
            const filePath = './speed-date-status.bak';
            writeFileSync(filePath, JSON.stringify(speedDateHelper.maleStatusList, null, 2));
            await message.channel.send({
                content: "speed-date-status-backup-" + new Date().toISOString(),
                files: [{
                    attachment: filePath,
                    name: 'speed-date-status.bak'
                }]
            });


            // return message.channel.send(matrixMessage);
        } else if (args[0] === "status") {
            // Logic to check the status of the speed date
            return message.reply("Checking the status of the speed date...");
        }
    }
}