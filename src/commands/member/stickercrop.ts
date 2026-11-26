import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickercrop",
  description: "Cria uma figurinha quadrada, cortando as bordas.",
  commands: ["stickercrop", "crop", "sc", "fc", "figquadrada"],
  fit: "cover",
});
