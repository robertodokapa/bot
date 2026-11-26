import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { proto } from "baileys";
import { installSoundStickerCodec } from "../services/audio-sticker.js";

installSoundStickerCodec();

function readVarint(buffer, offset) {
  let value = 0;
  let shift = 0;

  while (offset < buffer.length) {
    const byte = buffer[offset++];
    value |= (byte & 0x7f) << shift;
    if (!(byte & 0x80)) {
      return { value, offset };
    }
    shift += 7;
  }

  throw new Error("Truncated protobuf varint");
}

function readBytesField(buffer, fieldNumber) {
  let offset = 0;

  while (offset < buffer.length) {
    const tag = readVarint(buffer, offset);
    offset = tag.offset;
    const currentField = tag.value >>> 3;
    const wireType = tag.value & 7;

    if (wireType === 0) {
      const value = readVarint(buffer, offset);
      offset = value.offset;
      if (currentField === fieldNumber) {
        return value.value;
      }
    } else if (wireType === 2) {
      const length = readVarint(buffer, offset);
      const start = length.offset;
      const end = start + length.value;
      if (end > buffer.length) {
        throw new Error("Truncated protobuf field");
      }
      offset = end;
      if (currentField === fieldNumber) {
        return buffer.subarray(start, end);
      }
    } else {
      throw new Error(`Unsupported protobuf wire type: ${wireType}`);
    }
  }

  return undefined;
}

describe("Sound sticker protobuf encoding", () => {
  it("wraps an animated sticker and its audio in WhatsApp's sound-sticker message", () => {
    const sticker = proto.Message.StickerMessage.create({
      mimetype: "image/webp",
      isAnimated: true,
      width: 350,
      height: 350,
    });
    const audio = proto.Message.AudioMessage.encode({
      mimetype: "audio/ogg; codecs=opus",
      seconds: 2,
    }).finish();
    const message = proto.Message.create({ stickerMessage: sticker });

    Object.defineProperty(message, "soundStickerAudio", { value: audio });

    const encoded = proto.Message.encode(message).finish();
    const soundSticker = readBytesField(encoded, 134);
    const wrappedMessage = readBytesField(soundSticker, 1);
    const encodedSticker = readBytesField(wrappedMessage, 26);

    assert.ok(soundSticker);
    assert.equal(readBytesField(encodedSticker, 24), 0);
    assert.deepEqual(readBytesField(encodedSticker, 26), audio);
    assert.equal(proto.Message.decode(encoded).stickerMessage, null);
  });

  it("leaves ordinary sticker messages unchanged", () => {
    const message = proto.Message.create({
      stickerMessage: { mimetype: "image/webp", isAnimated: true },
    });

    const encoded = proto.Message.encode(message).finish();

    assert.ok(proto.Message.decode(encoded).stickerMessage);
    assert.equal(readBytesField(encoded, 134), undefined);
  });
});
