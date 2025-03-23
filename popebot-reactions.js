
export function drinkReacts(msg) {
    const messageString = msg.content.toLowerCase();

    const requestWords = [
        "get",
        "bring",
        "fetch",
        "give",
        "pour",
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

    // Check if the message contains any of the request words and any of the beverage words
    if (requestWords.some(word => messageString.includes(word)) && bevs.some(word => messageString.includes(word))) {
        const bvg = bevs.find(word => messageString.includes(word));
        msg.react(bvgWords[bvg]).catch((error) => console.log(error));
    }
}

export function foodReacts(msg) {
    const messageString = msg.content.toLowerCase();
    if (messageString.includes("bread")) {
        msg.react("🍞").catch((error) => console.log(error));
    }
}