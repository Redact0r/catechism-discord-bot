const fetch = require("node-fetch");

module.exports = {
  name: "!dadjoke",
  description: "Tells a dad joke",
  async execute(msg, args) {
    function getDadJoke() {
      return fetch("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((res) =>
          res.ok ? res.json() : new Error("Something's wrong with the API")
        )
        .then((data) => data["joke"])
        .catch((err) => console.error(err));
    }

    let dadJoke = await getDadJoke();

    return msg.reply(dadJoke);
  },
};
