# Contributing

This repository is one starter of the app-starters family: Node.js on [Koa](https://koajs.com/), one proxied route, a `/health` endpoint, and configuration read from `.env` by the runtime.

Default port: 3000. It comes from `.env`; nothing here hardcodes it.

## The shape a change has to keep

A starter, not a framework: runnable with `cp .env.example .env`, `pnpm install`, `pnpm start`, and readable in a minute. Every dependency has to earn its place in the first five minutes of a real project.

The test for any change: could someone who has never seen this repository have it answering requests from the README alone, and understand where their own routes go?

## Pull requests

- **`/health` keeps answering without dependencies.** It exists to separate "the process is up" from "the upstream is reachable"; a health check that fails when the upstream fails hides the thing it was built to show.
- **Configuration comes from `.env` via `node --env-file-if-exists`.** No `dotenv`, no config file in a format only this repository uses. A new variable is added to `.env.example` and to the table in the README, in the same commit.
- **The README is English.** Chinese belongs only under a *Notes for deployments in China* section, when there is something true to write there.
- **`Verify` has to keep proving something.** Any change in behaviour updates the command in that section.
- **Dependencies**: prefer the platform. `node:test`, `fetch` and `AbortSignal.timeout` are in the runtime; a package that wraps them is a maintenance cost with no return.
- **Commits**: imperative subject, one concern per commit. `fix: answer 504 when the upstream times out` is the shape. `update` is not.

## Adding a starter

Open an issue on [infra-blocks](https://github.com/kamaslau/infra-blocks) before writing anything — the family is meant to stay small, and two starters for the same framework is a maintenance cost rather than a choice.

If it is accepted:

1. Repository named `app-starters-<framework>`, MIT license, description in the form *what it is + what it gives you*.
2. README with the sections used across the family: title and one-line purpose, Run, Configuration, Verify, Why this shape, Use this template.
3. `is_template` enabled, and a row in the index under *Not in this list*.

## Reporting a problem

Open an issue with four things: the command you ran, what you expected, what happened, and the output of `pnpm start`. Without the last one, most reports turn into guesswork.

---

Part of the app-starters family · MIT
