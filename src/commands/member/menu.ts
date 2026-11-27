import { PREFIX } from "../../config.js";
import { readCommandImports } from "../../utils/index.js";

const CATEGORY_LABELS: Record<string, string> = {
  member: "👥 Comandos para membros",
  admin: "🛡️ Comandos para administradores",
  owner: "👑 Comandos para o dono",
};

const SECTION_LABELS: Record<string, string> = {
  sticker: "🎨 Figurinhas",
  stickerfit: "🎨 Figurinhas",
  stickercrop: "🎨 Figurinhas",
  stickerstretch: "🎨 Figurinhas",
  stickeraudio: "🎵 Figurinhas com áudio",
  stickeraudiofit: "🎵 Figurinhas com áudio",
  stickeraudiocrop: "🎵 Figurinhas com áudio",
  stickeraudiostretch: "🎵 Figurinhas com áudio",
  ping: "⚙️ Sistema",
  menu: "⚙️ Sistema",
};

const CATEGORY_ORDER: Record<string, number> = {
  member: 0,
  admin: 1,
  owner: 2,
};

export default {
  name: "menu",
  description: "Mostra os comandos disponíveis e seus atalhos.",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  handle: async ({ prefix, sendReply }) => {
    const commandGroups = await readCommandImports();
    const sections = Object.entries(commandGroups)
      .sort(
        ([first], [second]) =>
          (CATEGORY_ORDER[first] ?? 3) - (CATEGORY_ORDER[second] ?? 3),
      )
      .map(([category, commands]) => {
        const groupedCommands = new Map<string, any[]>();

        for (const command of commands) {
          if (
            !Array.isArray(command?.commands) ||
            command.commands.length === 0
          ) {
            continue;
          }

          const section =
            SECTION_LABELS[command.name] ??
            (category === "member"
              ? "📌 Comandos"
              : CATEGORY_LABELS[category] ?? `📌 Comandos: ${category}`);
          const sectionCommands = groupedCommands.get(section) ?? [];
          sectionCommands.push(command);
          groupedCommands.set(section, sectionCommands);
        }

        const commandLines = [...groupedCommands.entries()]
          .sort(([first], [second]) => first.localeCompare(second))
          .map(([section, sectionCommands]) => {
            const lines = sectionCommands
              .sort((first, second) =>
                first.commands[0].localeCompare(second.commands[0]),
              )
              .map((command) => {
                const usage = `${prefix}${command.commands[0]}`;
                const aliases = command.commands
                  .slice(1)
                  .map((alias) => `${prefix}${alias}`);

                return [
                  `• *${usage}*${aliases.length > 0 ? ` _(ou: ${aliases.join(", ")})_` : ""}`,
                  command.description ? `  └ ${command.description}` : "",
                ]
                  .filter(Boolean)
                  .join("\n");
              });

            return `*${section}*\n${lines.join("\n")}`;
          });

        if (commandLines.length === 0) {
          return "";
        }
 
        return commandLines.join("\n\n");
      })
      .filter(Boolean);

    await sendReply(
      `╭━━⪩ *COMANDOS* ⪨━━\n` +
        `▢ Prefixo: ${prefix}\n` +
        `▢ Use *${prefix}comando* para executar.\n` +
        `╰━━─「📋」─━━\n\n${sections.join("\n\n")}`,
    );
  },
};
