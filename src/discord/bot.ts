import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { wikiCommand, handleWikiButton } from "./commands.js";

const COMMANDS = [wikiCommand];
const WIKI_BUTTON_PREFIX = "wiki:";

export function createBot(_token: string, _applicationId: string): Client {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const cmd = COMMANDS.find((c) => c.data.name === interaction.commandName);
      if (cmd) await cmd.execute(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith(WIKI_BUTTON_PREFIX)) {
      await handleWikiButton(interaction);
    }
  });

  return client;
}

/**
 * Sync slash commands with Discord (global).
 * PUT replaces the app's entire command list, so this always makes Discord use
 * the current command definitions from code. Run on every startup so commands
 * stay up to date after deploys or code changes.
 */
export async function registerCommands(token: string, applicationId: string): Promise<void> {
  const rest = new REST().setToken(token);
  const body = COMMANDS.map((c) => c.data);
  await rest.put(Routes.applicationCommands(applicationId), { body });
  console.log(`Slash commands synced (${body.length} command(s)).`);
}

export async function startBot(token: string, applicationId: string): Promise<Client> {
  await registerCommands(token, applicationId);
  const client = createBot(token, applicationId);
  await client.login(token);
  return client;
}
