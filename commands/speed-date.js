import {ROLES, speedDateHelper} from "../services/utils.js";
import {writeFileSync} from "fs";
import channel from "./channel.js";
import got from "got";

const WAITING_ROOM_CHANNEL_ID = "1393591760260825199"

export default {
    name: "!speed-date",
    enabledInProd: false,
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
    },

    async backupMaleStatusList(message) {
        const channel = message.guild.channels.cache.get(speedDateHelper.backupChannelId);
        if (!channel) {
            console.error(`[ERROR] Backup channel with ID ${speedDateHelper.backupChannelId} not found.`);
            return;
        }
        console.debug(`[DEBUG] Backup channel found: ${channel.name}`);
        // Check if the channel is a text channel
        if (!channel.isTextBased()) {
            console.error(`[ERROR] Channel ${channel.name} is not a text channel.`);
            return;
        }
        // We need to delete the last backup message if it exists
        if (speedDateHelper.lastBackupMsgId) {
            try {
                const lastBackupMsg = await channel.messages.fetch(speedDateHelper.lastBackupMsgId);
                if (lastBackupMsg) {
                    console.debug(`[DEBUG] Deleting last backup message: ${lastBackupMsg.id}`);
                    await lastBackupMsg.delete();
                }
            } catch (error) {
                console.error(`[ERROR] Failed to delete last backup message: ${error.message}`);
            }
        }
        // Save the current status to a JSON file and upload it to the channel as a .bak file
        const filePath = './speed-date-status.bak';
        writeFileSync(filePath, JSON.stringify(speedDateHelper.maleStatusList, null, 2));
        const backupMsg = await channel.send({
            content: "speed-date-status-backup-" + new Date().toISOString(),
            files: [{
                attachment: filePath,
                name: 'speed-date-status.bak'
            }]
        });
        speedDateHelper.lastBackupMsgId = backupMsg.id;
    },
    /**
     * @description This function retrieves all the voice channels that start with "room-" or "date-"
     *              and returns them sorted by the number at the end of the channel name
     * @example
     * getWomensRooms(message)
     * @param message {import('discord.js').Message}
     * @returns {import('discord.js').Collection<string, import('discord.js').GuildBasedChannel>}
     */
    getWomensRooms(message) {
        // message.guild.channels.fetch(undefined, {force: true}).catch(console.error);
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
    },

    async execute(message, args, client) {
        // Check if the user has the required role to execute this command
        if (!message.member.roles.cache.some(role => role.id === ROLES.SHERIFF || role.id === ROLES.COMMUNITY_MANAGER || role.id === ROLES.DEPUTY)) {
            return message.reply("You do not have permission to use this command.");
        }
        if (!args[0]) {
            return message.reply("Please provide a valid command argument. Valid arguments are: `collect`, `status`, `update`.");
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
                speedDateHelper.lastBackupMsgId = args[1].split("/").pop();

                const backupData = m.attachments.find(attachment => attachment.name.endsWith('.bak') || attachment.name.endsWith('.json'));
                if (!backupData) {
                    return message.reply("No backup data found in the message.");
                }
                console.debug(`[DEBUG] Backup data found:`, backupData.name, backupData.url);
                const backupContentUrl = await backupData.url;
                console.debug(`[DEBUG] Backup content URL:`, backupContentUrl);
                const backupContent = await got(backupContentUrl).text();
                console.debug(`[DEBUG] Backup content:`, backupContent.length);

                // Parse the backup content
                try {
                    const backupJson = JSON.parse(backupContent);
                    // console.debug(`[DEBUG] Backup JSON:`, backupJson);
                    // Update the maleStatusList with the backup data
                    speedDateHelper.maleStatusList = backupJson;
                    console.debug(`[DEBUG] Updated maleStatusList from backup:`, speedDateHelper.maleStatusList.length);
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
            const waitingRoomChannel = await message.guild.channels.cache.find(c => c.id === WAITING_ROOM_CHANNEL_ID);
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
                name: room.name,
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

            await this.backupMaleStatusList(message)


        } else if (args[0] === "status") {
            // Logic to check the status of the speed date
            await this.outputTableToChat(this.getWomensRooms(message), message);

        } else if (args[0] === "update") {
            // This should walk every speed date room and check the male that is currently in the room and
            // update the maleStatusList with the room they are currently in
            const womenRooms = this.getWomensRooms(message);
            // console.debug(`[DEBUG] Women's rooms:`, womenRooms);
            if (womenRooms.size === 0) {
                return message.reply("No speed date rooms found.");
            }
            // Iterate through each room and check the members
            for (const [roomId, room] of womenRooms) {
                console.debug(`[DEBUG] Checking room: ${room.name}`);
                const male = room.members.filter(member => member.roles.cache.some(role => role.id === ROLES.MALE) /*&& !member.roles.cache.includes(ROLES.COMMUNITY_MANAGER) || !member.roles.cache.includes(ROLES.SHERIFF)*/);
                console.debug(`[DEBUG] Members in room ${room.name}:`, male);
                if (male.size > 0) {
                    // Update the maleStatusList with the room they are currently in
                    const member = male.first();
                    console.debug(`[DEBUG] Updating status for member: ${member.user.username} in room: ${room.name}`);
                    let memberIndex = speedDateHelper.maleStatusList.findIndex(m => m.username === member.user.username);
                    if (memberIndex === -1) {
                        console.warn(`[WARN] Member ${member.user.username} not found in maleStatusList. Adding them.`);
                        // If the member is not found, add them to the list
                        speedDateHelper.maleStatusList[speedDateHelper.maleStatusList.length] = {
                            username: member.user.username,
                            rooms: womenRooms.map(room => ({name: room.name, visited: false}))
                        };

                        memberIndex = speedDateHelper.maleStatusList.length - 1; // Set to the last index
                    }
                    console.debug(`[DEBUG] Member index: ${memberIndex}`);
                    // Find the room in the maleStatusList and update the visited status
                    if (!speedDateHelper.maleStatusList[memberIndex].rooms) {
                        console.warn(`[WARN] Member ${member.user.username} has no rooms in maleStatusList. Initializing rooms.`);
                        speedDateHelper.maleStatusList[memberIndex].rooms = womenRooms.map(room => ({
                            name: room.name,
                            visited: false
                        }))
                    }
                    console.debug(`[DEBUG] Member's rooms at index ${memberIndex}:`, speedDateHelper.maleStatusList[memberIndex].rooms);
                    const roomIndex = speedDateHelper.maleStatusList[memberIndex].rooms.findIndex(r => r.name === room.name);
                    console.debug(`[DEBUG] Member index: ${memberIndex}, Room index: ${roomIndex}`);
                    speedDateHelper.maleStatusList[memberIndex].rooms[roomIndex].visited = true;
                }
            }

            await this.backupMaleStatusList(message)

            // Send the updated status to the chat
            await this.outputTableToChat(womenRooms, message);
        }
    }
}