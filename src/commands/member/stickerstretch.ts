import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickerstretch",
  description:
    "Converte mídia em sticker esticando para preencher o quadrado sem recortar.",
  commands: [
    "stretch",
    "ss",
    "fe",
    "stickerstretch",
    "figesticada",
  ],
  fit: "stretch",
});
