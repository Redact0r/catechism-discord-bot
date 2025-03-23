
export async function drinkReacts(msg) {
    const messageString = msg.content.toLowerCase();

    const requestWords = [
        "get",
        "bring",
        "fetch",
        "give",
        "pour",
    ]

    const targetWords = [
        "me",
        "us",
        "them",
        "him",
        "her",
        "<@" // This is the beginning of a mention
    ]

    const bvgWords = {
        "beer": "🍺",
        "whiskey": "🥃",
        "rum": "🥃",
        "wine": "🍷",
        "boba": "🧋",
        "soda": "🥤",
        "juice": "🍹",
        "milk": "🥛",
        "coffee": "☕",
        "tea": "🍵",
    }

    const bevs = Object.keys(bvgWords);

    // Check if the message contains any of the request words
    if (requestWords.some(word => messageString.includes(word))) {
        console.debug("Request word found in message:", messageString);

        // Find the first request word in the message and get the next word, check if it's a target word
        const requestWord = requestWords.find(word => messageString.includes(word));
        const requestWordIndex = messageString.indexOf(requestWord);
        const messageList = messageString.split(" ")
        const nextWord = messageList[requestWordIndex + 1];
        console.debug("Next word after request word:", nextWord, "Request word index:", requestWordIndex);

        // Check if the next word is a target word
        if (targetWords.some(word => nextWord.includes(word))) {
            console.debug("Target word after request word:", nextWord);

            // Get all the beverage words in the message
            const bvgWordsInMessage = bevs.filter(word => messageString.includes(word));

            // If there are multiple beverage words, react with all of them
            if (bvgWordsInMessage.length > 1) {
                for (const bvg of bvgWordsInMessage) {
                    msg.react(bvgWords[bvg]).catch((error) => console.log(error));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

    }
}

export function foodReacts(msg) {
    const messageString = msg.content.toLowerCase();
    if (messageString.includes("bread")) {
        msg.react("🍞").catch((error) => console.log(error));
    }
}