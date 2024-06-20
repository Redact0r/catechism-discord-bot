const DATABASE_URL = process.env.DATABASE_URL;
const db = require("knex")({
  client: "pg",
  connection: DATABASE_URL,
  ssl: true,
});

/**
 * Service to handle user roles in the database.
 * @namespace RolesService
 */
const RolesService = {
  /**
   * Gets the roles for a specific user by their Discord ID.
   * @param {string} user_id - The Discord ID of the user.
   * @returns {Promise<Object>} A promise that resolves to the user's roles.
   */
  getUserRoles(user_id) {
    return db("roles")
      .select("roles")
      .where("discord_id", user_id)
      .then((res) => res[0])
      .catch((error) => console.log(error));
  },

  /**
   * Inserts a new user with roles into the database.
   * @param {Object} userWithRoles - An object containing the Discord ID and roles of the user.
   * @param {string} userWithRoles.discord_id - The Discord ID of the user.
   * @param {Array<Object>} userWithRoles.roles - The roles of the user.
   * @returns {Promise<Object>} A promise that resolves to the inserted user.
   */
  postRoles(userWithRoles) {
    return db("roles")
      .insert(userWithRoles)
      .into("roles")
      .returning("*")
      .then(([user]) => user)
      .catch((error) => console.log(error));
  },

  /**
   * Deletes a user from the database by their Discord ID.
   * @param {string} user_id - The Discord ID of the user.
   * @returns {Promise<unknown>}.
   */
  deleteUser(user_id) {
    return db("roles").where("discord_id", user_id).delete();
  },
};

module.exports = RolesService;
