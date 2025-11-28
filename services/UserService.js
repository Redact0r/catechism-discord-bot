import {CHANNELS, ROLES} from "./utils.js";
import {userMention} from "discord.js";

export class UserService {
    static async checkAndQuarantineUser(member) {
        // Parse member's joined timestamp and compare it to current time, if it is less than 1 week automatically quarrantine them
        const createdAt = member.user.createdAt;
        const now = new Date();
        const diff = now - createdAt;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;

        const logChannel = member.guild.channels.cache.get(CHANNELS.LOGS_CHANNEL_ID)
        const quarantineZoneChan = member.guild.channels.cache.get(CHANNELS.QUARANTINE_ZONE)
        if (diff < oneWeek) {
            await member.roles.add(ROLES.QUARANTINED);
            await logChannel.send(`User ${member.user.tag} (${userMention(member.id)}) has been automatically quarantined for joining less than a week ago.`);
            console.log(`[INFO] Quarantined new member ${member.user.tag} (${member.id}) who joined less than a week ago.`);
            quarantineZoneChan.send(`Welcome ${userMention(member.id)} to the Quarantine Zone! Your account has been flagged and you have been placed here for your safety. Please create a ticket asking for verification in ${CHANNELS.mentionable(CHANNELS.CONTACT_SUPPORT)}.`);
        }
    }
}