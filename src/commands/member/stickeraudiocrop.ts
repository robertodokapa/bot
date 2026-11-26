import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiocrop",
  description: "Cria uma figurinha com áudio cortando as bordas.",
  commands: ["stickeraudiocrop", "sacrop", "audiocrop"],
  fit: "cover",
  audio: true,
});
