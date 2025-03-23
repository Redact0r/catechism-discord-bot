
export function drinkReacts(msg) {
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
        // Find the first request word in the message and get the next word, check if it's a target word
        const requestWord = requestWords.find(word => messageString.includes(word));
        const requestWordIndex = messageString.indexOf(requestWord);
        const nextWord = messageString.split(" ")[requestWordIndex + 1];

        // Check if the next word is a target word
        if (targetWords.some(word => messageString.includes(word))) {
            // Get all the beverage words in the message
            const bvgWordsInMessage = bevs.filter(word => messageString.includes(word));
            // If there are multiple beverage words, react with all of them
            if (bvgWordsInMessage.length > 1) {
                bvgWordsInMessage.forEach(bvg => {
                    msg.react(bvgWords[bvg]).catch((error) => console.log(error));
                });
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