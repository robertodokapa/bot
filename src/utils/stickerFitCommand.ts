import { PREFIX } from "../config.js";
import { InvalidParameterError } from "../errors/index.js";
import { createAudioSticker } from "../services/audio-sticker.js";
import {
  createSticker,
  type StickerFit,
} from "../services/sticker.js";

type StickerFitCommandOptions = {
  name: string;
  description: string;
  commands: string[];
  fit: StickerFit;
  audio?: boolean;
};

export function createStickerFitCommand({
  name,
  description,
  commands,
  fit,
  audio = false,
}: StickerFitCommandOptions) {
  return {
    name,
    description,
    commands,
    usage: `${PREFIX}${commands[0]} (marque ou responda a mídia compatível)`,
    handle: async (paramsHandler: CommandHandleProps) => {
      if (
        audio
          ? !paramsHandler.isVideo
          : !paramsHandler.isImage && !paramsHandler.isVideo
      ) {
        throw new InvalidParameterError(
          audio
            ? "Você precisa marcar ou responder a um vídeo com áudio!"
            : "Você precisa marcar ou responder a uma imagem/gif/vídeo!",
        );
      }

      await paramsHandler.sendWaitReact();
      if (audio) {
        await createAudioSticker(paramsHandler, [fit]);
      } else {
        await createSticker(paramsHandler, [fit]);
      }
      await paramsHandler.sendSuccessReact();
    },
  };
}
