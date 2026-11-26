/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";
import { PACKAGE_VERSION } from "./utils/packageInfo.js";

export function menuMessage(groupJid) {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${prefix}
▢ • Versão: ${PACKAGE_VERSION}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢
▢ • ${prefix}off
▢ • ${prefix}on
▢
╰━━─「🌌」─━━

╭━━⪩ PRINCIPAL ⪨━━
▢
▢ • ${prefix}ping
▢
╰━━─「🚀」─━━

╭━━⪩ STICKERS ⪨━━
▢
▢ • ${prefix}sticker
▢ • ${prefix}stickerfit
▢ • ${prefix}stickercrop
▢ • ${prefix}stickerstretch
▢ • ${prefix}stickeraudio
▢ • ${prefix}stickeraudiofit
▢ • ${prefix}stickeraudiocrop
▢ • ${prefix}stickeraudiostretch
▢
╰━━─「🎨」─━━`;
}
