import { PREFIX } from "../../config.js";
import { readCommandImports } from "../../utils/index.js";

const CATEGORY_LABELS: Record<string, string> = {
  member: "👥 Comandos para membros",
  admin: "🛡️ Comandos para administradores",
  owner: "👑 Comandos para o dono",
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
        const commandLines = commands
          .filter(
            (command) =>
              Array.isArray(command?.commands) && command.commands.length > 0,
          )
          .sort((first, second) => first.name.localeCompare(second.name))
          .map((command) => {
            const usage = command.usage?.startsWith(PREFIX)
              ? `${prefix}${command.usage.slice(PREFIX.length)}`
              : `${prefix}${command.commands[0]}`;
            const aliases = command.commands
              .slice(1)
              .map((alias) => `${prefix}${alias}`);

            return [
              `• ${usage}`,
              aliases.length > 0 ? `  Atalhos: ${aliases.join(", ")}` : "",
              command.description ? `  ${command.description}` : "",
            ]
              .filter(Boolean)
              .join("\n");
          });

        if (commandLines.length === 0) {
          return "";
        }

        const title =
          CATEGORY_LABELS[category] ??
          `📌 Comandos: ${category}`;

        return `*${title}*\n${commandLines.join("\n")}`;
      })
      .filter(Boolean);

    await sendReply(
      `📋 *Comandos disponíveis*\nPrefixo: ${prefix}\n\n${sections.join("\n\n")}`,
    );
  },
};
