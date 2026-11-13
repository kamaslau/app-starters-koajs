# app-starters-koajs

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![GitHub top language](https://img.shields.io/github/languages/top/kamaslau/app-starters-koajs)
![Repository size](https://img.shields.io/github/repo-size/kamaslau/app-starters-koajs?color=56BEB8)

Node.js scaffold with [Koa](https://koajs.com/): one HTTP service, configuration from `.env`, and a `/health` endpoint.
The single route proxies a JSON API — enough to show where the logger, the timing header and the error path sit
before the real routes replace them.

A scaffold, not an infrastructure unit: it answers *what do I write the app in*, not *how do I make it run there*.
The second question belongs to [infrastructure blocks](https://github.com/kamaslau/infra-blocks).

## Requirements

Node.js 24 or newer — `engines` says `^26 || >=24`, which is what it is built and run on.
`pnpm`, or `npm` if you are prepared to regenerate the lockfile.

## Run

```bash
cp .env.example .env
pnpm install
pnpm start
```

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Port the process listens on |
| `API_URL` | — | JSON endpoint the single route proxies; without it the route answers `500` |

The start script passes `--env-file-if-exists=.env` to Node, so `.env` is read by the runtime instead of by
`dotenv` — the file may be missing without stopping the process. Nothing else comes from the environment.

## Verify

```bash
curl -s http://127.0.0.1:3000/health
# {"status":"ok"}
```

That proves the process is up and routing, and it holds even when nothing else does. Failures answer with a status
and log a line, both carrying the text from [http-response-text](https://github.com/kamaslau/http-response-text):

```bash
curl -s -w " %{http_code}\n" http://127.0.0.1:3000/
# {"error":"Internal Server Error","detail":"API_URL is not set"} 500   — API_URL left empty
# {"error":"Bad Gateway"} 502        — API_URL set, nothing answers on it
# {"error":"Gateway Timeout"} 504    — API_URL set, no answer within 5s
```

| What happened | Response | Log line |
|---|---|---|
| `API_URL` empty | `500` | `Proxy (500 Internal Server Error) API_URL is not set` |
| Upstream unreachable | `502` | `Proxy (502 Bad Gateway) ECONNREFUSED` |
| Upstream slower than 5s | `504` | `Proxy (504 Gateway Timeout) The operation was aborted due to timeout` |
| Upstream answered non-2xx | that status | `Proxy (404 Not Found) http://…` |
| `PORT` already in use | — | `Listen (409 Conflict) listen EADDRINUSE …`, exits `1` |

`/health` keeps answering `200` through all of it: the process being up and the upstream being reachable are two
different questions, and a restart loop on the first one hides the second.

Set `API_URL` to a JSON endpoint you trust and the same request answers `200` with that endpoint's body. A status
the upstream returns itself is passed on unchanged, so a `404` stays a `404` instead of becoming a `200` with an
error inside it. An endpoint that redirects is followed; one that answers HTML fails the JSON parse and lands on
the `502`. Message language follows `LANG` / `LC_ALL`, matched against `listLanguages()` from the installed http-response-text (`en`, `zh`, `ja`, `fr` today), and
the bodies above are the English default.

## Docker

```bash
docker build -t app-starters-koajs .
docker run --rm -p 3000:3000 app-starters-koajs
```

The image copies `.env.example` in as `.env`, so it starts with no arguments: `/health` answers at once, and the
proxy answers `500` until you give it an endpoint. To do that, mount your own file:
`docker run --rm -p 3000:3000 --env-file .env app-starters-koajs`.

Also published on Docker Hub as [liuyajie728/trial-koajs](https://hub.docker.com/r/liuyajie728/trial-koajs) — the image name predates the repository rename and stays as it is, since a Docker Hub repository cannot be renamed in place.

## Why this shape

One route, proxying one JSON endpoint. A starter that ships a database, an auth flow and a job queue is a starter nobody reads before building on top of it, and every one of those additions is a decision the project should make with its own context. What is here is the part every service needs on day one: a logger, a timing header, `/health`, and a place where errors become status codes.

The proxy is a real HTTP call rather than a mock, because the interesting failures are the network ones — refused, timed out, answered with the wrong content type — and a starter that hides them teaches nothing about where they surface. The status mapping in `src/app.js` is the reference: `500` for a missing variable, `502` for an upstream that never answered, `504` for one that answered too late.

`/health` answers without touching the upstream, deliberately. A health check that fails when a dependency fails turns a UI problem into a restart loop; the container stays up, and the proxy is the thing that reports the dependency.

Configuration comes from `node --env-file-if-exists`, not `dotenv`. The runtime has read env files since Node 20.12, the file may be absent without stopping the process, and there is one less dependency to audit.

The entry point is `src/app.js`, and the package's `main` points at it: `node .` resolves through the manifest, so the command in the README and the `CMD` in the `Dockerfile` cannot drift apart.

## Use this template

*Use this template* gives you a repository you own, with no history and no link back here — the right shape for
the first commit of a real app. Clone it instead when you want to follow changes to the starter itself;
a repository created from the template never receives them.

## License

MIT — see [LICENSE](./LICENSE). Take what is useful.
