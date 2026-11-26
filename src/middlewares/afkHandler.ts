import {
  getPrefix,
  listAfkMembers,
  removeAfkMember,
} from "../utils/database.js";

const MESSAGE_WRAPPERS = [
  "documentWithCaptionMessage",
  "editedMessage",
  "ephemeralMessage",
  "viewOnceMessage",
  "viewOnceMessageV2",
  "viewOnceMessageV2Extension",
];

function normalizeUserId(
  userId: string | null | undefined,
): string | undefined {
  return userId?.replace(/:\d+(?=@)/, "");
}

function getMessageContextInfo(message: Record<string, any> | null | undefined) {
  if (!message) {
    return null;
  }

  for (const content of Object.values(message)) {
    if (content?.contextInfo) {
      return content.contextInfo;
    }
  }

  for (const wrapper of MESSAGE_WRAPPERS) {
    const wrappedMessage = message[wrapper]?.message;

    if (wrappedMessage) {
      return getMessageContextInfo(wrappedMessage);
    }
  }

  return null;
}

/**
 * Responde quando uma mensagem menciona ou cita um membro ausente.
 *
 * @param {{ webMessage: import("baileys").WAMessage, commonFunctions: CommandHandleProps }} params
 */
export async function handleAfkReferences({ webMessage, commonFunctions }) {
  if (!commonFunctions.isGroup) {
    return;
  }

  const { commandName, prefix, remoteJid, userLid } = commonFunctions;
  const afkMembers = listAfkMembers(remoteJid);
  const isAfkCommand =
    prefix === getPrefix(remoteJid) &&
    ["afk", "ausente"].includes(commandName);

  if (!isAfkCommand && afkMembers[userLid]) {
    removeAfkMember(remoteJid, userLid);
    delete afkMembers[userLid];
  }

  const contextInfo = getMessageContextInfo(webMessage.message);

  if (!contextInfo) {
    return;
  }

  const referencedMembers = new Set<string>(
    (contextInfo.mentionedJid || [])
      .map(normalizeUserId)
      .filter((memberId): memberId is string => Boolean(memberId)),
  );

  if (contextInfo.quotedMessage && contextInfo.participant) {
    referencedMembers.add(normalizeUserId(contextInfo.participant));
  }

  if (!referencedMembers.size) {
    return;
  }

  for (const memberId of referencedMembers) {
    const reason = afkMembers[memberId];

    if (reason) {
      await commonFunctions.sendReply(
        `Ei! Essa pessoa encontra-se ausente!\n\nMotivo: ${reason}`,
      );
    }
  }
}
