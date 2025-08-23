export async function popebotReplies(msg) {
    const messageString = msg.content.toLowerCase();
    let chanceToSay = Math.floor(Math.random() * 100);

    await filteredWordResponse(msg)

    if (messageString.includes("thank") && messageString.includes("popebot")) {
        await msg.reply("You're welcome, my dude.").catch((error) => console.log(error));
    }

    if (messageString.includes("no cap")) {
        if (chanceToSay <= 5) {
            await msg.reply("Ultra rare: The Pope approves!").catch((error) => console.log(error));
        } else if (chanceToSay <= 20) {
            await msg.reply("Cap.").catch((error) => console.log(error));
        } else if (chanceToSay <= 40) {
            await msg.reply("No cap.").catch((error) => console.log(error));
        } else if (chanceToSay <= 60) {
            await msg.reply("Big cap.").catch((error) => console.log(error));
        } else if (chanceToSay <= 80) {
            await msg.reply("No cap fr.").catch((error) => console.log(error));
        } else {
            await msg.reply("Fr fr.").catch((error) => console.log(error));
        }
    }


    if (messageString.includes("heresy") || messageString.includes("heretic")) {
        if (chanceToSay >= 50) {
            await msg.reply("A heretic? Confess and repent!")
                .catch((error) => console.log(error));
        }
    }

    if (messageString.includes("sussy") || messageString.split(" ").includes("sus")) {
        if (chanceToSay >= 70) {
            await msg.reply("Sussy baka!").catch((error) => console.log(error));
        }
    }

    if (messageString.includes("hallelujah!") || messageString.includes("alleluia!")) {
        await msg.reply("Praise be!").catch((error) => console.log(error));
    }

    if (messageString.includes("achoo!")) {
        await msg.reply("God bless you.").catch((error) => console.log(error));
    }
}

async function filteredWordResponse(msg) {
    const messageString = msg.content.toLowerCase();
    const filterWords = ["fuck", "bitch", "cunt", "pussy", "asshole", "nipples"];

    // Take our list of filtered words and assign to a map for O(n) complexity
    const filterWordsMap = filterWords.reduce((acc, value, index, arr) => {
        acc[value] = true
        return acc
    }, {})

    if (filterWordsMap[messageString]) {
        await msg.reply("This is a Christian minecraft server.").catch((error) => console.log(error));
    }
}