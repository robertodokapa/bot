import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickerfit",
  description:
    "Converte mídia em sticker preservando a proporção com fundo transparente.",
  commands: ["sf", "inteiro", "inteira", "stickerfit", "fit", "ff", "figinteira"],
  fit: "contain",
});
