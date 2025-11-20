import {PermissionFlagsBits} from "discord.js";

const TEST_MODE = process.env.TEST_MODE === "true" || process.env.TEST_MODE === "1";
const LOGS_CHANNEL_ID = "891742946859311114";
const PROD_LOGS_CHANNEL_ID = "1378931217176461404";
export const CHANNELS = {
    MALE_INTROS: "1110735496004509706",
    FEMALE_INTROS: "1110735640473112666",
    MALE_INTROS_MENTIONABLE: "<#1110735496004509706>",
    FEMALE_INTROS_MENTIONABLE: "<#1110735640473112666>",
    LOGS_CHANNEL_ID: TEST_MODE ? LOGS_CHANNEL_ID : PROD_LOGS_CHANNEL_ID,
    LOGS_CHANNEL_MENTIONABLE: `<#${TEST_MODE ? LOGS_CHANNEL_ID : PROD_LOGS_CHANNEL_ID}>`,
    BANNED_USERS_CHANNEL: "896428187939139694",
    BANNED_USERS_CHANNEL_MENTIONABLE: "<#896428187939139694>",
    DB_CHANNEL_ID: "1413710587132776509",
    DB_CHANNEL_MENTIONABLE: "<#1413710587132776509>",
    mentionable(channelId) {
        return `<#${channelId}>`;
    }
}
export const ROLES = {
    FEMALE: "891419366745342012",
    FEMALE_MENTIONABLE: "<@&891419366745342012>",
    VERIFIED_FEMALE: "1196862071472660612",
    MALE: "891391330234818660",
    MALE_MENTIONABLE: "<@&891391330234818660>",
    VERIFIED_MALE: "1251422293213577258",
    SHERIFF: "890984994611265557",
    SHERIFF_MENTIONABLE: "<@&890984994611265557>",
    DEPUTY: "891744347454844978",
    DEPUTY_MENTIONABLE: "<@&891744347454844978>",
    QUARANTINED: "1333461375808176263",
    COMMUNITY_MANAGER: "1311587534433947679",
    COMMUNITY_MANAGER_MENTIONABLE: "<@&1311587534433947679>",
    WATCHMAN: "1406463467291938837",
    WATCHMAN_MENTIONABLE: `<@&1406463467291938837>`,
    DEAD: '1402664864580763695',
    mentionable: (roleId) => `<@&${roleId}>`,
};

export function getUserFromMention(mention, users) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }
        return users.get(mention);
    }
}

export function randomAdjective() {
    const arrayOfAdjectives = [
        "dastardly",
        "notorious",
        "insane",
        "quite yearning",
        "moody",
        "lovely",
        "infamous",
        "mischievous",
        "yearnful",
        "haunting",
        "bonk-deserving",
        "mind-boggling",
        "obtrusive",
        "termagent",
        "witty",
        "courageous",
        "funny",
        "precipitous",
        "pretty gay",
        "heretical",
        "tenacious",
        "sonorous",
        "nearly offensive",
        "superfluous",
        "extravagant",
        "unambiguous",
        "ethereal",
        "potentially lethal",
        "ominous",
        "curmudgeonly",
        "most holy",
        "borderline sinful",
        "concerning",
        "riveting",
        "entertaining",
        "quite nice",
        "horrific",
        "unruly",
        "honorable",
        "wistful",
        "endearing",
        "beguiling",
        "possibly illegal?",
        "mostly harmless",
        "confusing",
        "excessive",
        "not very Catholic",
    ];

    const randomIndex = Math.floor(
        Math.random() * (arrayOfAdjectives.length - 1)
    );

    return arrayOfAdjectives[randomIndex];
}

export function getVerificationInstructions(user, username = "unknown user") {
    return `Hello ${user ? `<@${user?.user?.id}>` : username},\n\nTo verify your account, please see below:\n
    An intro is required before sending any DMs. Please head to ${CHANNELS.MALE_INTROS_MENTIONABLE} or ${CHANNELS.FEMALE_INTROS_MENTIONABLE} and write yours. Selfies are optional.\n\nUntil you’re video verified, you’ll only be able to post your own intro—you won’t be able to view others’ intros or selfies. You may also temporarily lose visibility of your own intro; if you posted it, trust that it’s there.\n\nTo view the opposite sex’s introductions and selfies, you’ll need to be video verified. You can coordinate verification with a mod or verifier here. Our mod/verification team is busy and has their own schedules, so please be patient—we’ll get to you as soon as possible.\n\nImportant: Sending DMs without an intro is a bannable offense. Please follow the rules.\n\nThank you!`;
}

export function getNickNameFromGuildObjectWithUserId(guild, user_id) {
    let userObj = guild.members.filter((member) => member.user.id == user_id);
    let userMap = userObj.map((user) => user);
    let user = userMap[0].user || "user not found";
    console.log("LINE 2 FIRE", user);
    if (user === "user not found") return user;

    let userName = user.nickname ? user.nickname : user.username;

    return userName;
}

/**
 * Check if the interaction user has one of the specified roles
 * If no roles are specified, check for SHERIFF or DEPUTY
 * If the user is the guild owner, always return true
 * @param interaction {import('discord.js').CommandInteraction}
 * @param roles {string[]}
 * @returns {boolean}
 */
export function checkInteractionPermissions(interaction, ...roles) {
    if (interaction.user.id === interaction.guild.ownerId) {
        return true;
    }

    if (roles.length === 0) {
        roles = [ROLES.SHERIFF, ROLES.DEPUTY];
    }

    return !!interaction.member.roles.cache.some(r => roles.includes(r.id));
}


export function checkIfUserIsAuthorized(msg) {
    let authorized = false;

    const officerRole = msg.member.roles.cache.find(
        (role) => role.id === ROLES.SHERIFF
    );
    const modRole = msg.member.roles.cache.find(
        (role) => role.id === ROLES.DEPUTY
    );

    if (officerRole || modRole) {
        authorized = true;
    }
    return authorized;
}


export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * Returns the link to a message
 * @param msg {import('discord.js').Message}
 * @returns {string}
 */
export function getMessageLink(msg) {
    return `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
}

/**
 * Converts a number and unit to seconds
 * Uses the Go duration string format
 * https://golang.org/pkg/time/#ParseDuration
 * @param currentNumber {number|string}
 * @param currentUnit {string}
 * @returns {number}
 */
export function convertToSeconds(currentNumber, currentUnit) {
    let seconds = 0;
    switch (currentUnit) {
        case "s":
            seconds = parseInt(currentNumber);
            break;
        case "m":
            seconds = parseInt(currentNumber) * 60;
            break;
        case "h":
            seconds = parseInt(currentNumber) * 60 * 60;
            break;
        case "d":
            seconds = parseInt(currentNumber) * 60 * 60 * 24;
            break;
        default:
            break;
    }
    return seconds;
}

/**
 * time should be formatted like Go duration strings
 * https://golang.org/pkg/time/#ParseDuration
 * e.g. 1s, 1m, 1h, 1d
 * @param {string} time
 * @Returns {number} the duration in seconds
 */
export function parseDuration(time) {
    // Step through duration string and parse the time
    let duration = 0;
    let currentNumber = "";
    let currentUnit = "";
    for (let i = 0; i < time.length; i++) {
        if (isNaN(parseInt(time[i]))) {
            // If we have a number and a unit, add the time to the duration
            currentUnit += time[i];
            if (currentNumber && currentUnit) {
                duration += convertToSeconds(currentNumber, currentUnit);
                currentNumber = "";
                currentUnit = "";
            }
        } else {
            currentNumber += time[i];
        }
    }

    return duration;
}


/**
 * Converts seconds to a human-readable duration
 * @param {number} seconds
 * @returns {string}
 */
export function parseSecondsToDuration(seconds) {
    let time = "";
    if (seconds >= 86400) {
        time += `${Math.floor(seconds / 86400)}d `;
        seconds = seconds % 86400;
    }
    if (seconds >= 3600) {
        time += `${Math.floor(seconds / 3600)}h `;
        seconds = seconds % 3600;
    }
    if (seconds >= 60) {
        time += `${Math.floor(seconds / 60)}m `;
        seconds = seconds % 60;
    }
    time += `${seconds}s`;
    return time;
}


export const festaJuninaHelper = {
    _festaWatchStatusActive: false,

    set festaWatchStatus(bool) {
        this._festaWatchStatusActive = bool;
    },

    get festaWatchStatus() {
        return this._festaWatchStatusActive;
    },

    _festaIntervalIds: new Map(),

    set festaIntervalIds(id) {
        if (!this._festaIntervalIds) {
            this._festaIntervalIds = new Map();
        }
        this._festaIntervalIds.set(id.guildId, id);
    },

    get festaIntervalIds() {
        if (!this._festaIntervalIds) {
            this._festaIntervalIds = new Map();
        }
        return this._festaIntervalIds;
    }
}

export const speedDateHelper = {
    _maleStatusList: [],
    backupChannelId: "1401050631300714576",

    _lastBackupMsgId: null,
    get lastBackupMsgId() {
        return this._lastBackupMsgId;
    },
    set lastBackupMsgId(val) {
        this._lastBackupMsgId = val;
    },

    get maleStatusList() {
        return this._maleStatusList;
    },

    set maleStatusList(val) {
        this._maleStatusList = val;
    },

    getMaleInList(username) {
        return this._maleStatusList.find((status) => status.username === username);
    },

    set updateMaleInList(val) {
        if (!this._maleStatusList) {
            this._maleStatusList = [];
        }
        // Check if the value is already in the list
        const existingIndex = this._maleStatusList.findIndex(item => item.username === val.username);
        if (existingIndex !== -1) {
            // Update the existing entry
            this._maleStatusList[existingIndex].rooms = val.rooms;
        }
        else {
            // Add the new entry
            this._maleStatusList.push(val);
        }

        // Sort the list by username
        this._maleStatusList.sort((a, b) => a.username.localeCompare(b.username));
    },
}

export default {
    CHANNELS,
    ROLES,
    getUserFromMention,
    randomAdjective,
    getNickNameFromGuildObjectWithUserId,
    checkIfUserIsAuthorized,
    sleep,
    LOGS_CHANNEL_ID,
    PROD_LOGS_CHANNEL_ID,
    getMessageLink,
    convertToSeconds,
    parseDuration,
    parseSecondsToDuration,
    festaJuninaHelper,
    speedDateHelper,
}