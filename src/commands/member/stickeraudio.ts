import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createAudioSticker } from "../../services/audio-sticker.js";

export default {
  name: "stickeraudio",
  description: "Cria duas figurinhas animadas com áudio e enquadramentos diferentes.",
  commands: ["sa", "fa", "figa", "figaudio", "stickeraudio", "sticker-audio"],
  usage: `${PREFIX}stickeraudio (marque ou responda um vídeo com áudio; usa até 10 segundos)`,
  /**
   * @param {CommandHandleProps} paramsHandler
   */
  handle: async (paramsHandler) => {
    const { isVideo, sendWaitReact, sendSuccessReact } = paramsHandler;

    if (!isVideo) {
      throw new InvalidParameterError(
        "Você precisa marcar ou responder a um vídeo com áudio!",
      );
    }

    await sendWaitReact();
    await createAudioSticker(paramsHandler);
    await sendSuccessReact();
  },
};
