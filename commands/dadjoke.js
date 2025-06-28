import got from "got";

export default {
    name: "!dadjoke",
    description: "Tells a dad joke",
    async execute(msg, args) {
        async function getDadJoke() {
            const {joke, status} = await got("https://icanhazdadjoke.com/", {
                method: "GET",
                headers: {Accept: "application/json"},
            }).json()
            if (!joke) {
                console.error({
                    message: "Failed to fetch dad joke",
                    status,
                    joke,
                })
            }

            return joke;
        }

        let dadJoke = await getDadJoke();

        return msg.channel.send(dadJoke);
    },
};
