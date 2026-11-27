import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiocrop",
  description:
    "Converte um vídeo com áudio em sticker cortando para preencher o quadrado.",
  commands: [
    "sacrop",
    "sac",
    "stickeraudiocrop",
    "saudiocrop",
    "fac",
    "figaudioquadrada",
  ],
  fit: "cover",
  audio: true,
});
