import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickerstretch",
  description: "Cria uma figurinha esticada para preencher o quadrado.",
  commands: ["stickerstretch", "stretch", "ss", "fe", "figesticada"],
  fit: "stretch",
});
