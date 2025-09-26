import {CHANNELS, ROLES} from "./utils.js";

export class RolesService {
    /**
     * @type {import("discord.js").Client}
     */
    static client;
    static guildId;

    static async handleSexRoleChanges(oldMember, newMember, logChannel) {
        // Check if the user changed their gender role
        const isMale = oldMember.roles.cache.has(ROLES.MALE)
        const isFemale = oldMember.roles.cache.has(ROLES.FEMALE);

        const newIsMale = newMember.roles.cache.has(ROLES.MALE)
        const newIsFemale = newMember.roles.cache.has(ROLES.FEMALE)

        if ((isMale && newIsFemale) || (isFemale && newIsMale)) {
            console.log("User changed sex role!", newMember.user.username);
            await logChannel
                .send(
                    `Hey, ${ROLES.SHERIFF_MENTIONABLE} and ${ROLES.DEPUTY_MENTIONABLE}, <@${newMember.user.id}> changed their sex role!`
                )
                .catch((error) => console.log(error));
            await newMember.roles.add(ROLES.QUARANTINED)
                .catch(console.error)
        }
    }

    /**
     * Cache the status of all verified members in the guild.
     * @param newMember {import("discord.js").GuildMember}
     * @returns {Promise<void>}
     */
    static async cacheVerifiedMembers(newMember) {
        const members = await newMember.guild.members.fetch();
        const verifiedMembers = members.filter(member => member.roles.cache.find(r => r.id === ROLES.VERIFIED_FEMALE || r.id === ROLES.VERIFIED_MALE))

        const cache = []

        for (const [_, member] of verifiedMembers) {
            console.debug(member)
            const verifiedRole = member.roles.cache.find(r => r.id === ROLES.VERIFIED_FEMALE || r.id === ROLES.VERIFIED_MALE)
            cache.push({
                id: member.id,
                username: member.user.username,
                genderRole: verifiedRole.id,
            })
        }

        console.debug(JSON.stringify(cache, null, 2))
        console.debug(`[DEBUG] Cached ${cache.length} verified members.`)
    }

    static async updateVerifiedMembersCache(newMember) {
        let cache = await RolesService.getVerifiedMembersCache();
        if (!Array.isArray(cache)) {
            cache = [];
        }

        cache.push({
            id: newMember.id,
            username: newMember.user.username,
            genderRole: newMember.roles.cache.find(r => r.id === ROLES.VERIFIED_MALE || r.id === ROLES.VERIFIED_FEMALE),
        })
    }

    static async getVerifiedMembersCache(){
        const guild = await RolesService.client.guilds.fetch(RolesService.guildId)
        const dbChannel = await guild.channels.fetch(CHANNELS.DB_CHANNEL_ID)
        if (!dbChannel || !dbChannel.isTextBased()) {
            console.error("DB channel not found or is not text-based.");
            return [];
        }

        const messages = await dbChannel.messages.fetch({limit: 10});
        let dbMessage = messages.find(msg => msg.author.id === RolesService.client.user.id);
        if (!dbMessage) {
            console.warn("No DB message found.");
            return [];
        }

        const attachment = dbMessage.attachments.first();
        if (!attachment || attachment.size === 0) {
            console.warn("No attachment found in DB message.");
            return [];
        }

        const response = await fetch(attachment.url);
        const data = await response.json();
        return data;
    }

    static async saveToDbChannel(cache) {
        const guild = await RolesService.client.guilds.fetch(RolesService.guildId)
        const dbChannel = await guild.channels.fetch(CHANNELS.DB_CHANNEL_ID)
        if (!dbChannel || !dbChannel.isTextBased()) {
            console.error("DB channel not found or is not text-based.");
            return;
        }

        const messages = await dbChannel.messages.fetch({limit: 10});
        let dbMessage = messages.find(msg => msg.author.id === RolesService.client.user.id);
        // get attachment from message
        if (!dbMessage) {
            // Log a warning if no message is found
            console.warn("No DB message found, creating a new one.");
            dbMessage = await dbChannel.send("Database initialized.").catch(console.error);
        }

        const attachment = dbMessage.attachments.first();
        if (!attachment || attachment.size === 0) {
            console.warn("No attachment found in DB message, creating a new one.");
            await dbMessage.delete().catch(console.error);
            await dbChannel.send({
                content: "Database initialized.",
                files: [{attachment: Buffer.from(JSON.stringify(cache, null, 2)), name: 'db.json'}]
            }).catch(console.error);
            return;
        }

        // Update the attachment with the new cache data
        await dbMessage.delete().catch(console.error);
        await dbChannel.send({
            content: "Database updated.",
            files: [{attachment: Buffer.from(JSON.stringify(cache, null, 2)), name: 'db.json'}]
        }).catch(console.error);
    }
}
