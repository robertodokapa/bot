import assert from "node:assert/strict";
import { it } from "node:test";
import menu from "../commands/member/menu.js";

it("lists loaded commands using the current prefix", async () => {
  let response = "";

  await menu.handle({
    prefix: "!",
    sendReply: async (message) => {
      response = message;
    },
  });

  assert.match(response, /Prefixo: !/);
  assert.match(response, /!ping/);
  assert.match(response, /!stickeraudiofit/);
  assert.match(response, /!safit/);
  assert.match(response, /!s/);
  assert.match(response, /!figurinha/);
});
