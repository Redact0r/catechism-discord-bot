import got from "got";

export default {
  name: "!dadjoke",
  description: "Tells a dad joke",
  async execute(msg, args) {
    function getDadJoke() {
      const {data} = got("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: { Accept: "application/json" },
      }).json()
      if (!data) {
        throw new Error("Something's wrong with the API")
      }

      return data.joke;
    }

    let dadJoke = await getDadJoke();

    return msg.channel.send(dadJoke);
  },
};
