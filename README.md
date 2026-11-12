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

`dotenv` reads `.env` from the working directory. Nothing else comes from the environment.

## Verify

```bash
curl -s http://127.0.0.1:3000/health
# {"status":"ok"}
```

That proves the process is up and routing, and it holds even when nothing else does. The proxy has two failure
states, both checkable without any network:

```bash
curl -s -w " %{http_code}\n" http://127.0.0.1:3000/
# {"error":"API_URL is not set"} 500        — API_URL left empty
# {"error":"upstream request failed"} 502   — API_URL set, upstream unreachable
```

Set `API_URL` to a JSON endpoint you trust and the same request answers `200` with that endpoint's body.
An endpoint that redirects is followed; one that answers HTML fails the JSON parse and lands on the `502`.

## Docker

```bash
docker build -t app-starters-koajs .
docker run --rm -p 3000:3000 app-starters-koajs
```

The image copies `.env.example` in as `.env`, so it starts with no arguments: `/health` answers at once, and the
proxy answers `500` until you give it an endpoint. To do that, mount your own file:
`docker run --rm -p 3000:3000 --env-file .env app-starters-koajs`.

Also published on Docker Hub as [liuyajie728/trial-koajs](https://hub.docker.com/r/liuyajie728/trial-koajs) — the image name predates the repository rename and stays as it is, since a Docker Hub repository cannot be renamed in place.

## Use this template

*Use this template* gives you a repository you own, with no history and no link back here — the right shape for
the first commit of a real app. Clone it instead when you want to follow changes to the starter itself;
a repository created from the template never receives them.

## License

MIT — see [LICENSE](./LICENSE). Take what is useful.
