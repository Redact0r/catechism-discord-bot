const requestWords = [
    "get",
    "bring",
    "fetch",
    "give",
    "pour",
    "need",
    "i need",
    "i want",
    "i'll have",
    "i'll take",
    "i'd like",
]

const targetWords = [
    "me",
    "us",
    "them",
    "him",
    "her",
    "<@" // This is the beginning of a mention
]
/**
 * Apply drink reactions to a message based on the presence of certain words.
 * @param msg {import('discord.js').Message}
 * @returns {Promise<void>}
 */
export async function drinkReacts(msg) {
    const messageString = msg.content.toLowerCase();
    const bvgWords = {
        "beer": "🍺",
        "whiskey": "🥃",
        "rum": "🥃",
        "wine": "🍷",
        "boba": "🧋",
        "soda": "🥤",
        "juice": "🍹",
        "margarita": "🍹",
        "cocktail": "🍸",
        "champagne": "🍾",
        "milk": "🥛",
        "coffee": "☕",
        "tea": "🍵",
        "seltzer": "🥤",
    }

    await applyReactions(bvgWords, requestWords, messageString, targetWords, msg);
}

export async function foodReacts(msg) {
    const messageString = msg.content.toLowerCase();
    if (messageString.includes("bread")) {
        await msg.react("🍞").catch((error) => console.log(error));
    }
}

export async function otherReacts(msg) {
    const messageString = msg.content.toLowerCase();
    const emojiMap = {
        "cigar": "🚬",
        "cigarette": "🚬",
        "smoke": "🚬",
    }

    await applyReactions(emojiMap, requestWords, messageString, targetWords, msg);
}

/**
 * Apply reactions to a message based on the presence of certain words.
 * @param emojiMap {Object}
 * @param requestWords {Array<string>}
 * @param messageString {string}
 * @param targetWords {Array<string>}
 * @param msg {import('discord.js').Message}
 * @returns {Promise<void>}
 */
async function applyReactions(emojiMap, requestWords, messageString, targetWords, msg) {
    const emojiKeys = Object.keys(emojiMap);

    // Check if the message contains any of the request words
    if (requestWords.some(word => messageString.includes(word))) {
        console.debug("Request word found in message:", messageString);

        // Find the first request word in the message and get the next word, check if it's a target word
        const requestWord = requestWords.find(word => messageString.includes(word) || messageString.includes("popebot " + word));
        // console.debug("Request word found in message:", requestWord);
        const requestWordIndex = messageString.split(" ").indexOf(requestWord);
        const messageList = messageString.split(" ")
        const nextWord = messageList[requestWordIndex + 1];
        // console.debug("Next word after request word:", nextWord, "Request word index:", requestWordIndex);
        // console.debug("Message list:", messageList);

        // If the next word is undefined, return
        if (nextWord === undefined) {
            console.debug("Next word is undefined, returning.");
            return;
        }

        // Check if the next word is a target word
        if (targetWords.some(word => nextWord.includes(word))) {
            // console.debug("Target word after request word:", nextWord);

            // Get all the beverage words in the message
            const keysInMessage = emojiKeys.filter(word => messageString.includes(word));
            // console.debug("Emoji key words in message:", keysInMessage);

            // If there are multiple beverage words, react with all of them
            if (keysInMessage.length > 0) {
                for (const bvg of keysInMessage) {
                    await msg.react(emojiMap[bvg]).catch((error) => console.log(error));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

    }
}
