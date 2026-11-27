import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiofit",
  description:
    "Converte um vídeo com áudio em sticker preservando a proporção.",
  commands: [
    "safit",
    "saf",
    "stickeraudiofit",
    "saudiofit",
  ],
  fit: "contain",
  audio: true,
});
