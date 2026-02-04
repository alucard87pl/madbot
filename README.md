# Madbot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/platform-Discord-5865F2?logo=discord&logoColor=white)](https://discord.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Your ship’s computer, in Discord.** 🔍📡

Madbot taps into the same wikis you already geek out on—Memory Alpha, Stargate, Babylon 5, and more—and brings them right into the channel. One slash command, pick your database, type your query, and boom: canon at your fingertips. No more alt-tabbing to look up that episode or that character. Your reply stays private until you choose which link to beam into the chat so everyone gets the preview.

---

## What’s in the box

- **`/wiki`** — One command to rule them all. Pick a wiki, throw in a search, get back a list of hits (with snippets). Only you see the list; click the entry you want and Madbot posts that link in the channel so Discord can unfurl it. 🚀
- **Multiple wikis** — One bot, many databases. Memory Alpha for Trek, Stargate Wiki for gate lore, The Babylon Project for B5. More can be wired in as we go.
- **Tune the results** — Want 3 hits or 10? Set the limit (1–10) so you get exactly how many options you need.
- **Friendly when things go wrong** — No match? Typo? The bot does the “Did you mean …?” thing when the wiki supports it, so you’re not left in the dark.

---

## Supported wikis

| Code | Wiki |
|------|------|
| `ma` | [Memory Alpha](https://memory-alpha.fandom.com/) — Star Trek 🖖 |
| `sgc` | [Stargate Wiki](https://stargate.fandom.com/) — Indeed. |
| `b5` | [The Babylon Project](https://babylon5.fandom.com/) — Babylon 5 📜 |

More can be added; under the hood it’s built to work with any MediaWiki-based wiki (Fandom or not). **Want another wiki?** [Request one](https://github.com/alucard87pl/madbot/issues/new?template=wiki_request.yml&title=%5BWiki+request%5D+)—fill in the form and we'll get a PR opened to add it to `dev`.

---

## How to use

1. **Invite Madbot** to your server (see [Documentation](DOCUMENTATION.md#inviting-the-bot) if you’re the one hosting).
2. In any channel, summon **`/wiki`**.
3. Choose your **wiki**, type your **query** (e.g. *Jean-Luc Picard*, *1969*, *Sheridan*), and optionally tweak the **limit** (default 5).
4. In the reply only you see, **click the result** you want. Madbot drops that link in the channel so Discord can show the rich preview. Done. ⚡

---

## For captains and tinkerers

- **Running your own instance?** Env vars, Discord app setup, and all the wiring are in **[DOCUMENTATION.md](DOCUMENTATION.md)**.
- **Want to add a wiki or poke the code?** Same place—see the [Documentation](DOCUMENTATION.md) file.

---

## License

MIT
