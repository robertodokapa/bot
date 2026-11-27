import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createAudioSticker } from "../../services/audio-sticker.js";

export default {
  name: "stickeraudio",
  description:
    "Converte um vídeo com áudio em stickers animados com e sem corte.",
  commands: [
    "sa",
    "figurinhaaudio",
    "fa",
    "figa",
    "figaudio",
    "stickeraudio",
    "sticker-audio",
  ],
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
