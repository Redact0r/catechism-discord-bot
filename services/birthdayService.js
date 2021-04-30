const DATABASE_URL = process.env.DATABASE_URL;
const db = require("knex")({
  client: "pg",
  connection: DATABASE_URL,
  ssl: true,
});

const birthdayService = {
  //user_id | birth_month | birth_day | current_age
  // user_id (string), mm (int), dd (int), age (int)

  getUserBirthday(user_id) {
    return db("birthdays")
      .select("*")
      .where("user_id", user_id)
      .then((res) => res[0])
      .catch((error) => console.log(error));
  },

  updateBonkCount(user_id) {
    return db("bonk_table").increment("bonkCount", 1).where("user_id", user_id);
  },

  minusBonkCountByOne(user_id) {
    return db("bonk_table")
      .increment("bonkCount", -1)
      .where("user_id", user_id);
  },

  makeNewUser(newUser) {
    return db.insert(newUser).into("bonk_table").returning("*");
  },

  getTop5Bonks() {
    return db("bonk_table").select("*").orderBy("bonkCount", "desc").limit(5);
  },
};

module.exports = birthdayService;
