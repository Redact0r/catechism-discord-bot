const DATABASE_URL = process.env.DATABASE_URL;
const db = require("knex")({
  client: "pg",
  connection: DATABASE_URL,
  ssl: true,
});

const RolesService = {
  getUserRoles(user_id) {
    return db("roles")
      .select("roles")
      .where("discord_id", user_id)
      .then((res) => res[0])
      .catch((error) => console.log(error));
  },

  postRoles(userWithRoles) {
    return db("roles")
      .insert(userWithRoles)
      .into("roles")
      .returning("*")
      .then(([user]) => user)
      .catch((error) => console.log(error));
  },

  deleteUser(user_id) {
    return db("roles").where("discord_id", user_id).delete();
  },
};

module.exports = RolesService;
