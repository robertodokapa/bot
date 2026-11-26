import { createStickerFitCommand } from "../../utils/stickerFitCommand.js";

export default createStickerFitCommand({
  name: "stickeraudiostretch",
  description: "Cria uma figurinha com áudio esticando a imagem.",
  commands: ["stickeraudiostretch", "sastretch", "audiostretch"],
  fit: "stretch",
  audio: true,
});
