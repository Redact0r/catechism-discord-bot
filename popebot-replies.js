
export function popebotReplies(msg) {
    const messageString = msg.content.toLowerCase();

    filteredWordResponse(msg)

    if (messageString.includes("smite")) {
        msg.channel.send("Exorcizamus te!").catch((error) => console.log(error));
    }

    if (messageString.includes("thank") && messageString.includes("popebot")) {
        msg.reply("You're welcome, my dude.").catch((error) => console.log(error));
    }

    if (messageString.includes("no cap") && messageString.includes("popebot")) {
        msg.reply("fr fr").catch((error) => console.log(error));
    }

    if (messageString.includes("heresy") || messageString.includes("heretic")) {
        let chanceToSay = Math.floor(Math.random() * 100);

        if (chanceToSay < 50)
            msg.reply("A heretic? Confess and repent!")
                .catch((error) => console.log(error));
    }

    if (messageString.includes("sussy") || messageString.includes("sus")) {
        msg.reply("Sussy baka!").catch((error) => console.log(error));
    }

    if (messageString.includes("hallelujah!")) {
        msg.reply("Praise be!").catch((error) => console.log(error));
    }

    if (messageString.includes("achoo!")) {
        msg.reply("God bless you.").catch((error) => console.log(error));
    }
}

function filteredWordResponse(msg) {
    const messageString = msg.content.toLowerCase();
    const filterWords = ["fuck", "bitch", "cunt", "pussy", "asshole", "nipples"];

    // Take our list of filtered words and assign to a map for O(n) complexity
    const filterWordsMap = filterWords.reduce((acc, value, index, arr) => {
        acc[value] = true
        return acc
    }, {})

    if (filterWordsMap[messageString]) {
        msg.reply("This is a Christian minecraft server.").catch((error) => console.log(error));
    }
}