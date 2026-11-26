import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickerfit",
  description: "Cria uma figurinha preservando o enquadramento original.",
  commands: ["stickerfit", "fit", "sf", "ff", "figinteira"],
  fit: "contain",
});
