/**
 * Madbot — Discord wiki lookup bot.
 * Set DISCORD_TOKEN and DISCORD_APPLICATION_ID in .env to run the bot.
 */

import "dotenv/config";
import { startBot } from "./discord/bot.js";

export { createMediaWikiProvider, getProvider, getRegistryChoices, getRegisteredCodes } from "./wiki/index.js";
export type { WikiProvider, WikiSearchResponse, WikiSearchResult } from "./wiki/index.js";

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  console.error(
    "Missing DISCORD_TOKEN or DISCORD_APPLICATION_ID in .env. Copy .env.example to .env and add values from the Discord Developer Portal."
  );
  process.exit(1);
}

startBot(token, applicationId).catch((err) => {
  console.error("Bot failed to start:", err);
  process.exit(1);
});
