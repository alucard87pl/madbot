# Madbot — Documentation

Technical setup, configuration, and development guide for Madbot.

---

## Requirements

- **Node.js 18+** (for native `fetch` and ESM).
- A [Discord Application](https://discord.com/developers/applications/) and bot token (for running the bot).

---

## Setup

```bash
npm install
cp .env.example .env
```

Add your Discord token and Application ID to `.env` (see [Integrating the Discord app](#integrating-the-discord-app) below). Never commit `.env` or share the token.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes (for bot) | Bot token from Discord Developer Portal → Your App → Bot. |
| `DISCORD_APPLICATION_ID` | Yes (for bot) | Application ID from Developer Portal → Your App → General Information. |

Copy from `.env.example` and fill in after creating your Discord application.

---

## Integrating the Discord app

After creating an application at the [Discord Developer Portal](https://discord.com/developers/applications/):

### 1. Get the Application ID

- Open your application → **General Information**.
- Copy **Application ID** into `.env` as `DISCORD_APPLICATION_ID`.

### 2. Create the bot and get the token

- In the left sidebar, open **Bot**.
- Click **Add Bot** if you haven’t already.
- Under **Token**, click **Reset Token** (or **View Token**), then **Copy**.
- Paste into `.env` as `DISCORD_TOKEN`. **Never commit this value or share it.**

### 3. Inviting the bot

- In the app, go to **OAuth2** → **URL Generator**.
- **Scopes:** check `bot` and `applications.commands`.
- **Bot permissions:** at least **Send Messages** and **Use Application Commands** (or “Use Slash Commands”).
- Copy the generated URL, open it in a browser, choose a server, and authorize.

### 4. Run the bot

```bash
npm run dev
# or
npm run build && npm start
```

You should see `Logged in as YourBot#1234` and `Slash commands synced (1 command(s)).` Use `/wiki` in your server. Slash commands can take a short while to appear everywhere; if needed, wait or re-open the server.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm run start` | Run compiled bot (`node dist/index.js`). |
| `npm run dev` | Run `src/index.ts` with tsx watch. |
| `npm run wiki -- "query"` | Test wiki search from the CLI (default wiki). Use `npm run wiki -- ma "Voyager"` or `npm run wiki -- b5 "Sheridan"` for a specific wiki. |
| `npm run lint` | Run ESLint on `src`. |

---

## Project layout

```
src/
  index.ts          Entry; starts Discord client (requires .env).
  cli.ts            CLI for testing wiki search (no Discord).
  discord/
    bot.ts          Client setup and slash command registration.
    commands.ts     /wiki slash command, ephemeral reply, result buttons.
  wiki/
    types.ts        WikiProvider interface and shared types.
    mediawiki.ts    MediaWiki/Fandom API client.
    providers.ts    Builds providers from wiki list; getProvider, choices.
    wikis.ts        Wiki list (code, name, baseUrl, label). Edit here to add wikis.
```

- **Adding a wiki:** Add an entry to the `WIKIS` array in `src/wiki/wikis.ts`. The bot and CLI pick it up automatically. For non-standard API paths, see “MediaWiki and non-Fandom wikis” below.
- **Wiki request automation:** Users can open an issue with the "Wiki request" template (code, name, base URL, label). The repo needs a **`wiki-request`** label. A GitHub Action parses the issue, adds the entry to `wikis.ts`, and opens a PR targeting `main`. Review and merge the PR to add the wiki.
- **Non–MediaWiki wikis:** Implement the `WikiProvider` interface (see `src/wiki/types.ts`) and wire it in `providers.ts` (and optionally in the wiki list if you add a way to select it).

---

## Wiki list and MediaWiki

- **Wiki data** lives in `src/wiki/wikis.ts`. Only `providers.ts` and this file use it.
- **MediaWiki (including non-Fandom):** The current client uses the standard MediaWiki API (`action=query` + `list=search`). If a wiki’s API is not at `baseUrl/api.php` (e.g. Wikipedia uses `/w/api.php`), add optional `apiUrl` support to the wiki entry and pass it through to `createMediaWikiProvider` in `providers.ts`.

---

## Command sync

Slash commands are **re-registered on every startup** via a PUT to Discord’s application commands API. That keeps Discord’s command list in sync with the code after deploys or changes. Discord clients may cache the list for a while; users might need to wait or restart Discord to see updates.

---

## Branching

We use **short-lived feature branches** and a single long-lived **`main`** branch:

- **`main`** — deployable default branch. Wiki-request PRs and feature PRs merge here.
- **Feature work** — create a branch from `main` (e.g. `feature/something` or `fix/thing`), make changes, open a PR into `main`. After merge, delete the branch. No long-lived `dev` branch; everything flows into `main`.
