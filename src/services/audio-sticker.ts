import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  generateWAMessage,
  getAudioDuration,
  prepareWAMessageMedia,
  proto,
} from "baileys";
import { BOT_EMOJI, BOT_NAME, TEMP_DIR } from "../config.js";
import { getContent, getRandomName } from "../utils/index.js";
import {
  addStickerMetadata,
  getStickerFitFilter,
  type StickerFit,
} from "./sticker.js";

const execFileAsync = promisify(execFile);
const MAX_DURATION_SECONDS = 10;
const SOUND_STICKER_PATCH = Symbol.for("takeshi.audioStickerCodec");

async function getSoundStickerAudioDuration(audioBuffer, fallbackDuration) {
  const fallbackSeconds = Math.min(
    MAX_DURATION_SECONDS,
    Math.max(1, Math.round(fallbackDuration)),
  );

  try {
    const duration = await getAudioDuration(audioBuffer);

    if (Number.isFinite(duration) && duration > 0) {
      return Math.min(MAX_DURATION_SECONDS, Math.max(1, Math.round(duration)));
    }

    console.warn(
      "A duração do áudio da figurinha é inválida; usando a duração do vídeo.",
    );
  } catch (error) {
    console.warn(
      "Não foi possível detectar a duração do áudio da figurinha; usando a duração do vídeo.",
      error,
    );
  }

  return fallbackSeconds;
}

async function runMediaCommand(command, args) {
  try {
    await execFileAsync(command, args, { maxBuffer: 1024 * 1024 });
  } catch (error) {
    const details = error.stderr?.trim() || error.message;
    throw new Error(`Erro ao processar mídia: ${details}`);
  }
}

export function buildAudioStickerFilterGraph(fits: StickerFit[]) {
  const filterInputs = fits
    .map((_, index) => `[base${index}]`)
    .join("");
  const filterChains = fits.map((fit, index) => {
    const fitFilter = getStickerFitFilter(fit, 350);
    const filters = [
      `[base${index}]trim=duration=${MAX_DURATION_SECONDS}`,
      "setpts=PTS-STARTPTS",
      fitFilter,
      "fps=15",
      "setsar=1",
    ];

    return `${filters.join(",")}[v${index}]`;
  });

  return [
    `[0:v]split=${fits.length}${filterInputs}`,
    ...filterChains,
  ].join(";");
}

export function installSoundStickerCodec() {
  if (proto.Message[SOUND_STICKER_PATCH]) {
    return;
  }

  const originalEncode = proto.Message.encode;

  proto.Message.encode = function encodeSoundSticker(message, writer) {
    const stickerMessage = message?.stickerMessage;
    const audioMessageBytes = Reflect.get(message, "soundStickerAudio");

    if (!stickerMessage || !audioMessageBytes) {
      return originalEncode.call(this, message, writer);
    }

    const messageWithoutSticker = Object.create(
      Object.getPrototypeOf(message),
    );

    for (const key of Object.keys(message)) {
      if (key !== "stickerMessage" && key !== "soundStickerAudio") {
        messageWithoutSticker[key] = message[key];
      }
    }

    const output = originalEncode.call(this, messageWithoutSticker, writer);

    output
      .uint32((134 << 3) | 2)
      .fork()
      .uint32((1 << 3) | 2)
      .fork()
      .uint32((26 << 3) | 2)
      .fork();

    proto.Message.StickerMessage.encode(stickerMessage, output)
      .uint32(24 << 3)
      .uint32(0)
      .uint32((26 << 3) | 2)
      .bytes(audioMessageBytes)
      .ldelim()
      .ldelim()
      .ldelim();

    return output;
  };

  Object.defineProperty(proto.Message, SOUND_STICKER_PATCH, { value: true });
}

async function sendSoundSticker({
  socket,
  remoteJid,
  webMessage,
  stickerBuffer,
  audioMessage,
}) {
  const userJid = socket.authState.creds.me?.id;

  if (!userJid) {
    throw new Error("A sessão do WhatsApp não está autenticada.");
  }

  const outgoing = await generateWAMessage(
    remoteJid,
    { sticker: stickerBuffer, isAnimated: true },
    {
      userJid,
      upload: socket.waUploadToServer,
      quoted: webMessage,
    },
  );

  if (!audioMessage || !outgoing.message?.stickerMessage || !outgoing.key.id) {
    throw new Error("Não foi possível preparar a figurinha com áudio.");
  }

  installSoundStickerCodec();
  Object.defineProperty(outgoing.message, "soundStickerAudio", {
    value: proto.Message.AudioMessage.encode(audioMessage).finish(),
  });

  await socket.relayMessage(remoteJid, outgoing.message, {
    messageId: outgoing.key.id,
  });

  try {
    await socket.upsertMessage(outgoing, "append");
  } catch (error) {
    console.error("Erro ao registrar figurinha com áudio no histórico:", error);
  }
}

export async function createAudioSticker(
  paramsHandler,
  fits: StickerFit[] = ["contain", "cover"],
) {
  const {
    downloadVideo,
    remoteJid,
    socket,
    webMessage,
  } = paramsHandler;
  const videoMessage = getContent(webMessage, "video");
  const duration = Number(videoMessage?.seconds || 0);

  if (!videoMessage) {
    throw new Error("Marque ou responda a um vídeo para criar a figurinha com áudio.");
  }

  if (!duration) {
    throw new Error(
      "Não foi possível identificar a duração do vídeo.",
    );
  }

  const inputPath = await downloadVideo(webMessage, getRandomName());
  const stickerOutputPaths = fits.map(() =>
    path.resolve(TEMP_DIR, getRandomName("webp")),
  );
  const audioOutputPath = path.resolve(TEMP_DIR, getRandomName("ogg"));
  const stickerPaths = [];

  try {
    const filterGraph = buildAudioStickerFilterGraph(fits);
    const ffmpegArgs = [
      "-hide_banner",
      "-loglevel",
      "error",
      "-nostdin",
      "-y",
      "-i",
      inputPath,
      "-filter_complex",
      filterGraph,
    ];

    for (const [index, stickerOutputPath] of stickerOutputPaths.entries()) {
      ffmpegArgs.push(
        "-map",
        `[v${index}]`,
        "-t",
        String(MAX_DURATION_SECONDS),
        "-an",
        "-c:v",
        "libwebp",
        "-pix_fmt",
        "yuva420p",
        "-loop",
        "0",
        "-quality",
        "8",
        "-compression_level",
        "6",
        "-method",
        "6",
        "-preset",
        "picture",
        "-f",
        "webp",
        stickerOutputPath,
      );
    }

    ffmpegArgs.push(
      "-map",
      "0:a:0",
      "-t",
      String(MAX_DURATION_SECONDS),
      "-vn",
      "-af",
      "aresample=async=1:first_pts=0,asetpts=PTS-STARTPTS",
      "-ac",
      "1",
      "-ar",
      "48000",
      "-c:a",
      "libopus",
      "-b:a",
      "64k",
      "-avoid_negative_ts",
      "make_zero",
      "-f",
      "ogg",
      audioOutputPath,
    );
    await runMediaCommand("ffmpeg", ffmpegArgs);

    const metadata = {
      username: '',
      botName: `${BOT_EMOJI} ${BOT_NAME}`,
    };
    const audioBuffer = await fs.readFile(audioOutputPath);
    const audioDurationSeconds = await getSoundStickerAudioDuration(
      audioBuffer,
      duration,
    );
    const { audioMessage } = await prepareWAMessageMedia(
      {
        audio: audioBuffer,
        mimetype: "audio/ogg; codecs=opus",
        seconds: audioDurationSeconds,
        ptt: false,
      },
      { upload: socket.waUploadToServer },
    );
    if (!audioMessage) {
      throw new Error("Não foi possível preparar o áudio da figurinha.");
    }
    audioMessage.mimetype = "audio/ogg; codecs=opus";
    audioMessage.seconds = audioDurationSeconds;
    audioMessage.ptt = false;

    for (const stickerOutputPath of stickerOutputPaths) {
      const stickerPath = await addStickerMetadata(
        await fs.readFile(stickerOutputPath),
        metadata,
      );
      stickerPaths.push(stickerPath);

      await sendSoundSticker({
        socket,
        remoteJid,
        webMessage,
        stickerBuffer: await fs.readFile(stickerPath),
        audioMessage,
      });
    }
  } finally {
    for (const filePath of [
      inputPath,
      ...stickerOutputPaths,
      audioOutputPath,
      ...stickerPaths,
    ]) {
      if (filePath) {
        await fs.rm(filePath, { force: true });
      }
    }
  }
}
