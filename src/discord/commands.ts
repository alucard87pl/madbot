import {
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { getProvider, getRegistryChoices } from "../wiki/index.js";

const DEFAULT_RESULT_LIMIT = 5;
const MIN_RESULT_LIMIT = 1;
const MAX_RESULT_LIMIT = 10;
const BUTTONS_PER_ROW = 5;
const BUTTON_PREFIX = "wiki:";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BUTTON_LABEL_MAX = 80; // Discord limit

const choices = getRegistryChoices();

/** Cache for result URLs: id -> { urls, createdAt } */
const resultCache = new Map<string, { urls: string[]; createdAt: number }>();

function pruneCache(): void {
  const now = Date.now();
  for (const [id, entry] of resultCache.entries()) {
    if (now - entry.createdAt > CACHE_TTL_MS) resultCache.delete(id);
  }
}

export const wikiCommand = {
  data: new SlashCommandBuilder()
    .setName("wiki")
    .setDescription("Search a wiki and get links to articles")
    .addStringOption((opt) =>
      opt
        .setName("wiki")
        .setDescription("Which wiki to search")
        .setRequired(true)
        .addChoices(...choices)
    )
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search term (e.g. character or topic name)").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("limit")
        .setDescription(`Max number of results to show (default ${DEFAULT_RESULT_LIMIT})`)
        .setRequired(false)
        .setMinValue(MIN_RESULT_LIMIT)
        .setMaxValue(MAX_RESULT_LIMIT)
    )
    .toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const wikiCode = interaction.options.getString("wiki", true);
    const query = interaction.options.getString("query", true).trim();
    if (!query) {
      await interaction.reply({ content: "Please enter a search term.", flags: MessageFlags.Ephemeral });
      return;
    }

    const limit = interaction.options.getInteger("limit") ?? DEFAULT_RESULT_LIMIT;
    const clampedLimit = Math.min(MAX_RESULT_LIMIT, Math.max(MIN_RESULT_LIMIT, limit));

    const provider = getProvider(wikiCode);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await provider.search(query, clampedLimit);

    if (result.error || result.results.length === 0) {
      const text = [result.message, result.suggestion ? `*Suggestion: ${result.suggestion}*` : null]
        .filter(Boolean)
        .join("\n");
      await interaction.editReply({ content: text || "No results." });
      return;
    }

    const topResults = result.results.slice(0, clampedLimit);
    const urls = topResults.map((r) => r.url);
    const cacheId = `wiki-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    pruneCache();
    resultCache.set(cacheId, { urls, createdAt: Date.now() });

    const embed = new EmbedBuilder()
      .setColor(0x1e88e5)
      .setTitle(`Wiki: ${provider.name}`)
      .setDescription(`Search results for **${escapeMarkdown(query)}**. Click a result to post its link in the channel.`)
      .setTimestamp()
      .setFooter({ text: provider.baseUrl });

    const fields = topResults.map((r) => ({
      name: r.title,
      value: [r.url, r.snippet ? truncate(r.snippet, 200) : null].filter(Boolean).join("\n"),
      inline: false,
    }));
    embed.addFields(fields);

    const buttons = topResults.map((r, i) =>
      new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIX}${cacheId}:${i}`)
        .setLabel(truncate(r.title, BUTTON_LABEL_MAX))
        .setStyle(ButtonStyle.Secondary)
    );
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < buttons.length; i += BUTTONS_PER_ROW) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + BUTTONS_PER_ROW)));
    }

    await interaction.editReply({ embeds: [embed], components: rows });
  },
};

/**
 * Handle wiki result button: post chosen URL to the channel, then acknowledge.
 */
export async function handleWikiButton(interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.slice(BUTTON_PREFIX.length).split(":");
  const id = parts[0];
  const index = parseInt(parts[1], 10);
  if (parts.length !== 2 || !id || Number.isNaN(index)) {
    await interaction.reply({ content: "Invalid button. Run /wiki again.", flags: MessageFlags.Ephemeral });
    return;
  }
  pruneCache();
  const entry = resultCache.get(id);
  if (!entry) {
    await interaction.reply({ content: "This menu has expired. Run /wiki again.", flags: MessageFlags.Ephemeral });
    return;
  }
  resultCache.delete(id);

  const url = entry.urls[index];
  if (!url) {
    await interaction.reply({ content: "Invalid selection.", flags: MessageFlags.Ephemeral });
    return;
  }

  const channel = interaction.channel;
  if (channel && "send" in channel) {
    await (channel as { send: (opts: { content: string }) => Promise<unknown> }).send({ content: url });
  }
  await interaction.update({
    content: "Link posted below.",
    embeds: [],
    components: [],
  });
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + "…";
}

function escapeMarkdown(s: string): string {
  return s.replace(/([*_`~\\|])/g, "\\$1");
}
