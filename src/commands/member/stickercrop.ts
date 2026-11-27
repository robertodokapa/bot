import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickercrop",
  description:
    "Converte mídia em sticker cortando para preencher o quadrado inteiro.",
  commands: [
    "sc",
    "quadrado",
    "quadrada",
    "stickercrop",
    "crop",
    "fc",
    "figquadrada",
  ],
  fit: "cover",
});
