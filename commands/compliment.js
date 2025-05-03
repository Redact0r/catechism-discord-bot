const {default: fetch} = require("node-fetch");

module.exports = {
    name: "!compliment",
    description: "Compliments a user",
    async execute(msg, args) {
        const compliments = [
            "Your smile brightens everyone's day!",
            "You have an amazing sense of style.",
            "Your positive energy is contagious.",
            "You're incredibly thoughtful.",
            "Your creativity knows no bounds.",
            "You have a beautiful soul.",
            "Your kindness makes a difference.",
            "You're so easy to talk to.",
            "Your laugh is absolutely delightful.",
            "You have a brilliant mind.",
            "You inspire people without even trying.",
            "Your confidence is admirable.",
            "You're incredibly talented.",
            "Your perspective is refreshing.",
            "You make hard work look easy.",
            "You have the best ideas.",
            "Your passion is inspiring.",
            "You light up any room you enter.",
            "Your dedication is impressive.",
            "You have a heart of gold.",
            "Your attention to detail is remarkable.",
            "You're a natural leader.",
            "Your enthusiasm is infectious.",
            "You have incredible patience.",
            "Your wisdom is beyond your years.",
            "You're exceptionally thoughtful.",
            "Your generosity is heartwarming.",
            "You have impeccable taste.",
            "Your honesty is refreshing.",
            "You're a fantastic listener.",
            "Your strength is admirable.",
            "You have a wonderful sense of humor.",
            "Your authenticity is beautiful.",
            "You're remarkably insightful.",
            "Your optimism is uplifting.",
            "You have a gift for making others feel special.",
            "Your resilience is inspiring.",
            "You're incredibly articulate.",
            "Your compassion knows no bounds.",
            "You have a magnetic personality.",
            "Your determination is motivating.",
            "You're exceptionally clever.",
            "Your warmth is comforting.",
            "You have a way with words.",
            "Your intelligence is impressive.",
            "You're genuinely delightful to be around.",
            "Your courage is admirable.",
            "You have amazing intuition.",
            "Your sincerity is rare and valued.",
            "You're incredibly resourceful.",
            "Your thoughtfulness never goes unnoticed.",
            "You have a beautiful perspective on life.",
            "Your ambition is inspiring.",
            "You're remarkably perceptive.",
            "Your grace under pressure is impressive.",
            "You have a calming presence.",
            "Your imagination is wonderful.",
            "You're exceptionally caring.",
            "Your enthusiasm for life is contagious.",
            "You have a beautiful mind.",
            "Your charm is undeniable.",
            "You're incredibly supportive.",
            "Your empathy is touching.",
            "You have a radiant personality.",
            "Your curiosity is inspiring.",
            "You're wonderfully unique.",
            "Your perseverance is admirable.",
            "You have a natural elegance.",
            "Your ingenuity is impressive.",
            "You're remarkably talented.",
            "Your consideration for others is beautiful.",
            "You have a wonderful way of expressing yourself.",
            "Your charisma is captivating.",
            "You're incredibly dependable.",
            "Your humility is refreshing.",
            "You have a special spark about you.",
            "Your adaptability is impressive.",
            "You're exceptionally kind-hearted.",
            "Your wit is delightful.",
            "You have an admirable work ethic.",
            "Your presence is a gift.",
            "You're remarkably selfless.",
            "Your enthusiasm is motivating.",
            "You have a beautiful way of seeing the world.",
            "Your reliability is appreciated.",
            "You're incredibly sincere.",
            "Your potential is limitless.",
            "You have a wonderful aura about you.",
            "Your attentiveness is touching.",
            "You're exceptionally genuine.",
            "Your spirit is inspiring.",
            "You have a remarkable ability to overcome obstacles.",
            "Your zest for life is contagious.",
            "You're wonderfully thoughtful.",
            "Your inner beauty shines through.",
            "You have a gift for bringing joy to others.",
            "Your authenticity is refreshing.",
            "You're truly one of a kind."
        ];


        let compliment = compliments[Math.floor(Math.random() * compliments.length)];

        if (!compliment) {
            return console.error(
                "No compliment found. API issue? This is the raw data from the server: " +
                compliment
            );
        }

        if (args[1] && !args[1].startsWith("<@"))
            return msg.reply("I can't compliment someone who doesn't exist.");

        if (args[1] && args[1].includes("750161264482975805"))
            return msg.reply("I'm flattered.");

        if (args[1] && args[1].startsWith("<@"))
            return msg.channel.send(`${args[1]} ${compliment}`);

        return msg.reply(compliment);
    },
};
