import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  generateWAMessage,
  prepareWAMessageMedia,
  proto,
} from "baileys";
import { BOT_EMOJI, BOT_NAME, TEMP_DIR } from "../config.js";
import { getContent, getRandomName, getUserName } from "../utils/index.js";
import { addStickerMetadata } from "./sticker.js";

const execFileAsync = promisify(execFile);
const MAX_DURATION_SECONDS = 10;
const SOUND_STICKER_PATCH = Symbol.for("takeshi.audioStickerCodec");

async function runMediaCommand(command, args) {
  try {
    await execFileAsync(command, args, { maxBuffer: 1024 * 1024 });
  } catch (error) {
    const details = error.stderr?.trim() || error.message;
    throw new Error(`Erro ao processar mídia: ${details}`);
  }
}

export function installSoundStickerCodec() {
  if (proto.Message[SOUND_STICKER_PATCH]) {
    return;
  }

  const originalEncode = proto.Message.encode;

  proto.Message.encode = function encodeSoundSticker(message, writer) {
    const stickerMessage = message?.stickerMessage;
    const audioMessageBytes = message?.soundStickerAudio;

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
  audioBuffer,
}) {
  const userJid = socket.authState.creds.me?.id;

  if (!userJid) {
    throw new Error("A sessão do WhatsApp não está autenticada.");
  }

  const { audioMessage } = await prepareWAMessageMedia(
    {
      audio: audioBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: false,
    },
    { upload: socket.waUploadToServer },
  );

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

export async function createAudioSticker(paramsHandler) {
  const {
    downloadVideo,
    remoteJid,
    socket,
    userLid,
    webMessage,
  } = paramsHandler;
  const videoMessage = getContent(webMessage, "video");
  const duration = Number(videoMessage?.seconds || 0);

  if (!videoMessage) {
    throw new Error("Marque ou responda a um vídeo para criar a figurinha com áudio.");
  }

  if (!duration || duration > MAX_DURATION_SECONDS) {
    throw new Error(
      `O vídeo precisa ter entre 1 e ${MAX_DURATION_SECONDS} segundos.`,
    );
  }

  const inputPath = await downloadVideo(webMessage, getRandomName());
  const stickerOutputPath = path.resolve(TEMP_DIR, getRandomName("webp"));
  const audioOutputPath = path.resolve(TEMP_DIR, getRandomName("ogg"));
  let stickerPath;

  try {
    const { stdout: audioStream } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type",
        "-of",
        "csv=p=0",
        inputPath,
      ],
      { maxBuffer: 1024 * 1024 },
    );

    if (!audioStream.trim()) {
      throw new Error("O vídeo precisa conter uma faixa de áudio.");
    }

    await runMediaCommand("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-t",
      String(MAX_DURATION_SECONDS),
      "-vf",
      "scale=350:350,fps=15",
      "-c:v",
      "libwebp",
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
      "-an",
      "-f",
      "webp",
      stickerOutputPath,
    ]);

    await runMediaCommand("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:a:0",
      "-t",
      String(MAX_DURATION_SECONDS),
      "-vn",
      "-ac",
      "1",
      "-ar",
      "48000",
      "-c:a",
      "libopus",
      "-b:a",
      "64k",
      "-f",
      "ogg",
      audioOutputPath,
    ]);

    const metadata = {
      username: '',
      botName: `${BOT_EMOJI} ${BOT_NAME}`,
    };
    stickerPath = await addStickerMetadata(
      await fs.readFile(stickerOutputPath),
      metadata,
    );

    await sendSoundSticker({
      socket,
      remoteJid,
      webMessage,
      stickerBuffer: await fs.readFile(stickerPath),
      audioBuffer: await fs.readFile(audioOutputPath),
    });
  } finally {
    for (const filePath of [
      inputPath,
      stickerOutputPath,
      audioOutputPath,
      stickerPath,
    ]) {
      if (filePath) {
        await fs.rm(filePath, { force: true });
      }
    }
  }
}
