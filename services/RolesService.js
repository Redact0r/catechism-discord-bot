import {ROLES} from "./utils.js";

export class RolesService {
  static async handleSexRoleChanges(oldMember, newMember, logChannel) {
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
}
