import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { setBotDisabled } from "../../utils/database.js";

export default {
  name: "off",
  description: "Desativa o bot globalmente",
  commands: ["off", "bangp"],
  usage: `${PREFIX}off`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }
    setBotDisabled(true);
    await sendSuccessReply("Bot desativado para todos os usuários!");
  },
};
