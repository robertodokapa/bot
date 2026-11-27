import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiostretch",
  description:
    "Converte um vídeo com áudio em sticker esticando para preencher o quadrado.",
  commands: [
    "sastretch",
    "sas",
    "fae",
    "stickeraudiostretch",
    "saudiostretch",
    "figaesticada",
  ],
  fit: "stretch",
  audio: true,
});
