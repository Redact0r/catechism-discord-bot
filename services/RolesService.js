const {ROLES} = require("./utils");
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

  async handleSexRoleChanges(oldMember, newMember, logChannel) {
    // Check if the user changed their gender role
    const isMale = oldMember.roles.cache.has(ROLES.MALE)
    const isFemale = oldMember.roles.cache.has(ROLES.FEMALE);

    const newIsMale = newMember.roles.cache.has(ROLES.MALE)
    const newIsFemale = newMember.roles.cache.has(ROLES.FEMALE)

    if ((isMale && newIsFemale) || (isFemale && newIsMale)) {
      console.log("User changed sex role!", newMember.user.username);
      await logChannel
          .send(
              `Hey, ${ROLES.SHERIFF_MENTIONABLE} and ${ROLES.DEPUTY_MENTIONABLE}, <@${newMember.user.id}> changed their sex role!`
          )
          .catch((error) => console.log(error));
      await newMember.roles.add(ROLES.QUARANTINED)
          .catch(console.error)
    }
  }
};

module.exports = RolesService;
