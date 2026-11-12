# trial-koajs

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![GitHub top language](https://img.shields.io/github/languages/top/kamaslau/trial-koajs)
![Repository size](https://img.shields.io/github/repo-size/kamaslau/trial-koajs?color=56BEB8)

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

That proves the process is up and routing. The proxy is a second, separate check — it fails when the upstream is
unreachable, and it should:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
# 200 with a working API_URL, 502 when the upstream is down
```

## Docker

```bash
docker build -t trial-koajs .
docker run --rm -p 3000:3000 trial-koajs
```

The image copies `.env.example` in as `.env` so it starts with no arguments. For a real endpoint, pass your own:
`docker run --rm -p 3000:3000 --env-file .env trial-koajs`.

Also published on Docker Hub as [liuyajie728/trial-koajs](https://hub.docker.com/r/liuyajie728/trial-koajs).

## License

MIT — see [LICENSE](./LICENSE). Take what is useful.
