---
title: 'Building an AI Chat Plugin for Obsidian from Scratch — A Solo Dev Story'
description: 'How I built obsidian-cola: an AI-powered sidebar chat plugin for Obsidian with file context awareness, from architecture design to dual-platform submission. A complete dev log with real decisions, failures, and lessons learned.'
pubDate: 'Jun 28 2026'
---

I'm a junior college student interning at an AI startup. I use Obsidian for notes, and I use Cola (an AI desktop agent) for everything else. One day I realized: every time I need AI help while writing, I have to switch windows, paste context, wait for a response, then copy it back.

That friction was annoying enough that I decided to build a plugin that puts Cola directly inside Obsidian's sidebar. What followed was a two-week sprint from zero to a working product submitted to both the Obsidian Community Plugins registry and the Cola Plugin Store.

Here's how it went — the architecture decisions, the things that broke, and what I'd do differently.

## The Problem

My workflow looked like this:

1. Writing in Obsidian
2. Hit a question → switch to Cola desktop app
3. Paste the relevant text, explain what file I'm working on
4. Get an answer → switch back to Obsidian
5. Paste the result

Steps 2-5 took 30 seconds each time, and I'd lose my writing flow. The obvious fix: bring Cola into Obsidian so the AI already knows what I'm working on.

## Architecture: The Hard Part

The first real decision was *how* to connect Obsidian to Cola. I considered three approaches:

### Option A: HTTP API

Obsidian plugin calls Cola's HTTP API directly. Simple, but Cola's API is authenticated and meant for external services, not local plugins. Plus, HTTP is request-response — no streaming.

### Option B: Local WebSocket Bridge (chosen)

Build two components:
- A **Cola Channel Plugin** that runs a local WebSocket server
- An **Obsidian Plugin** that connects to it as a client

This gives us real-time bidirectional communication, local-only (no network), and Cola treats it as a proper channel (like Telegram or Feishu).

### Option C: Shared File

Both Cola and Obsidian watch a shared file. Too hacky, race conditions, no real-time.

**I went with Option B.** The tradeoff is complexity (two codebases to maintain), but the UX is better than anything else.

The final architecture:

```
┌─────────────────────┐        WebSocket         ┌──────────────────────────┐
│  Obsidian Plugin    │ ◄── ws://127.0.0.1:19533 ──► Cola Channel Plugin    │
│  (Sidebar UI)       │                           │  (Local WS Server)       │
│                     │   ← messages + actions →   │                          │
│  • ColaView.ts      │                           │  • ctx.deliver() → Cola  │
│  • ColaGateway.ts   │                           │  • outbound.sendText()   │
└─────────────────────┘                           └──────────────────────────┘
                                                           ↕
                                                     Cola AI Agent
```

Both components are TypeScript. The Obsidian plugin uses the official Plugin API; the Cola side uses `@marswave/cola-plugin-sdk`.

## Day 1: Cola Channel Plugin

The Cola side was built first because I could test it with `wscat` before the Obsidian UI existed.

Key decisions:
- **Port 19533** — arbitrary, unlikely to conflict
- **Token auth** — on first launch, generate a random hex token, write it to `~/.cola/plugins/obsidian/local-token`. The Obsidian plugin reads this file to authenticate. Zero configuration for the user.
- **Message flow**: receive from WebSocket → `ctx.deliver()` to Cola agent → Cola responds → `outbound.sendText()` back to WebSocket

The first working version took about 2 hours. I could send a message from terminal and get Cola's response:

```bash
wscat -c "ws://127.0.0.1:19533?token=abc123"
> Hello
< Hi! How can I help?
```

**First bug:** Cola's plugin SDK has a `commands` block for registering slash commands. I added a `status` command, but it conflicted with an internal SDK command. Fix: just don't use commands.

**Second bug:** The plugin wasn't authorized to send messages. Fix: call `identity.bind()` during channel setup so Cola trusts this channel.

## Day 1 (continued): Obsidian Plugin UI

With the backend working, I built the Obsidian plugin — a sidebar `ItemView` with a chat interface.

Core files:
- `main.ts` — Plugin lifecycle, registers the view and commands
- `ColaView.ts` — The chat UI (message list, input box, status bar)
- `ColaGateway.ts` — WebSocket client with auto-reconnect
- `styles.css` — Chat bubble styling

The first version was ugly but functional. Send message → see Cola's response in the sidebar → file context (current open file) automatically attached.

**It worked on the first try.** I sent "summarize this file" while editing a markdown note, and Cola correctly summarized the file content. That moment felt great.

## Week 1: Making It Not Suck

The MVP worked, but the UX was rough. Over the next few days I iterated through two rounds of polish:

### Round 1 — Usability fixes

- **Long text overflow** — messages broke the layout. Fixed with `word-break: break-word` and `overflow-x: auto` on code blocks.
- **Can't select text** — needed explicit `user-select: text`
- **Token staleness** — if Cola restarts, the token changes. Fixed by re-reading the token file on every reconnect attempt.
- **Chat persistence** — messages disappeared on plugin reload. Added `saveData`/`loadData` to persist chat history.
- **Input auto-resize** — textarea grows with content, maxes at 150px
- **Code block copy button** — hover to copy
- **Exponential backoff reconnect** — 3s → 6s → 12s → 30s max

### Round 2 — UI/UX alignment with Cola desktop

- Rounder bubbles (12px radius), more spacing
- Input redesigned as a unified container (textarea + send button), similar to ChatGPT's input style
- All icons replaced with Lucide SVGs for consistency
- Configurable send shortcut (Enter vs Ctrl+Enter)
- Removed the "new chat" button from header, moved to settings page

## v0.2: Select → Send → Insert

The feature that made it actually useful for writing:

1. **Select text → Send to Cola** — two commands registered as Obsidian editor callbacks:
   - `send-selection-to-cola`: sends immediately
   - `ask-cola-about-selection`: fills the input box so you can add context before sending

2. **Insert response back** — every assistant message gets an "insert" button. Click it, and the response is inserted at cursor position in your current editor.

This completed the loop: select confusing paragraph → ask Cola to explain → insert the revised version. No window switching, no clipboard management.

## v0.3: Teaching Cola to Operate the Vault

This was the most ambitious feature — and the one that partially failed.

The idea: Cola should be able to open files, create files, and search your vault. I designed an action protocol:

1. On connection, Obsidian sends the vault file list (up to 500 .md paths) to the Cola Channel Plugin
2. The Channel Plugin injects these into the first user message as context
3. Cola's responses can contain action markers: `<!--cola-action:{"type":"openFile","path":"..."}-->`
4. The Channel Plugin strips these markers and forwards actions to the Obsidian plugin
5. Obsidian executes: open file (with fuzzy matching), create file, or search

**What worked:** The infrastructure — vault list sending, action parsing, execution in Obsidian. All tested and functional.

**What didn't work:** Cola never actually outputs those action markers. The Cola agent's system prompt doesn't know about this protocol. Channel plugins can inject context into messages, but they can't modify the agent's core behavior.

**Lesson learned:** I built the entire pipeline before verifying the most critical assumption — that Cola would cooperate. The code is in place and will work once the Cola platform supports channel-level system prompts. But right now it's dead infrastructure.

If I did this again, I'd test the assumption first with a simple prompt injection, before building the parsing and execution layer.

## v0.3.1: Performance — Paginated Rendering + Search

As chat history grew, the UI got sluggish. Two fixes:

- **Paginated rendering** — only render the last 50 messages initially. Scroll to top → load 50 more. All messages still stored; only rendering is lazy.
- **Search** — header search button, real-time filtering across all history. Escape to exit search mode.
- **Thinking animation** — "Cola is thinking" with bouncing dots. Small thing, but it makes the wait feel active rather than broken.

## Splitting Repos and Submitting for Review

The original code lived in one monorepo (`obsidian-cola`). For submission, I split into:

- **[cola-obsidian](https://github.com/heran11011/cola-obsidian)** — Obsidian Community Plugin, with GitHub Actions for automated releases
- **[cola-plugin-obsidian](https://github.com/heran11011/cola-plugin-obsidian)** — Cola Plugin Store submission

The Obsidian submission required:
- MIT license
- Proper `manifest.json` with unique ID (`cola`)
- A release with `main.js`, `manifest.json`, and `styles.css` as assets
- Submitted via the community plugins web form (they deprecated PRs to obsidian-releases)

The Cola submission was a PR to the official plugins monorepo.

Both are currently in review queues.

## What I'd Do Differently

1. **Test assumptions before building infrastructure.** The vault action protocol (v0.3) was a week of work that doesn't actually function yet because I didn't verify Cola would output the markers.

2. **Start with the UI, not the backend.** I built the WebSocket server first, which meant testing with `wscat` — functional but doesn't catch UX issues. Building the UI first would have surfaced problems like text overflow and selection issues earlier.

3. **Use a framework for the chat UI.** I wrote the entire chat interface with raw DOM manipulation (`createEl`, `innerHTML`). It works, but it's 400+ lines of imperative UI code that's hard to maintain. If I started over, I'd consider Svelte or Preact for the view layer.

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Obsidian Plugin | TypeScript, Obsidian API (ItemView, Plugin, MarkdownRenderer), esbuild |
| Cola Channel Plugin | TypeScript, ws, @marswave/cola-plugin-sdk, tsup |
| Communication | WebSocket (local-only, token auth) |
| CI/CD | GitHub Actions (auto-release on tag) |

## Numbers

- **~1200 lines of TypeScript** across both components
- **2 weeks** from idea to dual-platform submission
- **10 iterations** of the chat UI before it felt right
- **1 failed feature** (vault actions — infrastructure ready, waiting on platform support)
- **0 dependencies** beyond Obsidian API and Cola SDK on the plugin side

## What's Next

- Waiting for Obsidian community review (can take weeks)
- Once Cola supports channel-level system prompts, vault actions will activate automatically
- Considering adding image support (Cola can generate images; rendering them in the sidebar would be useful)

---

If you're thinking about building an Obsidian plugin — especially one that connects to an external service — the local WebSocket bridge pattern worked well. It keeps everything on-device, avoids CORS issues, and gives you real-time streaming for free.

The full source code is at [github.com/heran11011/obsidian-cola](https://github.com/heran11011/obsidian-cola).

---

*Written by Heran — a college junior building things with AI, one plugin at a time.*
