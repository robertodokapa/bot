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
▢ • *${prefix}sticker* _(ou: ${prefix}s, ${prefix}figurinha)_ — Converte mídia em sticker WebP.
▢ • *${prefix}sf* _(ou: ${prefix}inteiro, ${prefix}inteira)_ — Preserva proporção com fundo transparente.
▢ • *${prefix}sc* _(ou: ${prefix}quadrado, ${prefix}quadrada)_ — Preenche o quadrado cortando a mídia.
▢ • *${prefix}stretch* _(ou: ${prefix}ss, ${prefix}fe)_ — Estica a mídia para preencher o quadrado.
▢ • *${prefix}sa* _(ou: ${prefix}s, ${prefix}figurinha)_ — Cria stickers animados com áudio.
▢ • *${prefix}safit* _(ou: ${prefix}sf, ${prefix}inteiro, ${prefix}inteira)_ — Sticker com áudio preservando proporção.
▢ • *${prefix}sacrop* _(ou: ${prefix}sc, ${prefix}quadrado, ${prefix}quadrada)_ — Sticker com áudio cortando para preencher.
▢ • *${prefix}sastretch* _(ou: ${prefix}stretch, ${prefix}ss, ${prefix}fe)_ — Sticker com áudio esticado.
▢
╰━━─「🎨」─━━`;
}
