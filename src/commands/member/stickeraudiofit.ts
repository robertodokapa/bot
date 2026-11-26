import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiofit",
  description: "Cria uma figurinha com áudio preservando o enquadramento.",
  commands: ["stickeraudiofit", "safit", "audiofit"],
  fit: "contain",
  audio: true,
});
