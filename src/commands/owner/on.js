import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { activateGroup, setBotDisabled } from "../../utils/database.js";

export default {
  name: "on",
  description: "Ativa o bot globalmente",
  commands: ["on"],
  usage: `${PREFIX}on`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }
    setBotDisabled(false);
    activateGroup(remoteJid);
    await sendSuccessReply("Bot ativado para todos os usuários!");
  },
};
