import Koa from 'koa'
import { getStatus } from 'http-response-text'
import 'dotenv/config'

const port = Number(process.env.PORT ?? 3000)
const timeout = 5_000

// Languages supported by http-response-text, anything else falls back to English
const languages = ['en', 'zh', 'ja']

const detectLanguage = () => {
  const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG
    || Intl.DateTimeFormat().resolvedOptions().locale
  const language = locale.split(/[-_.]/)[0].toLowerCase()

  return languages.find((item) => item === language) ?? 'en'
}

const language = detectLanguage()

const report = async (code, label, payload) => {
  const { message } = await getStatus(code, language)
  const line = `${label} (${code} ${message})`
  // fetch wraps a socket error in a TypeError with a generic message: prefer the cause
  const detail = payload instanceof Error || payload instanceof DOMException
    ? payload.cause?.code || payload.message || payload.name
    : payload

  if (code < 400) console.log(line, detail ?? '')
  else console.error(line, detail ?? '')
}

const app = new Koa()

app.on('error', (error) => report(500, 'App', error))

// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// health — answers without touching the upstream API
app.use(async (ctx, next) => {
  if (ctx.path !== '/health') return next()

  ctx.body = { status: 'ok' }
})

// response
app.use(async ctx => {
  const url = process.env.API_URL

  // Configuration failure, not a request failure: say which variable is missing
  if (!url) {
    ctx.status = 500
    ctx.body = { error: (await getStatus(500, language)).message, detail: 'API_URL is not set' }
    await report(500, 'Proxy', ctx.body.detail)
    return
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) })

    // Upstream answered, with a status of its own — pass that one on
    if (!response.ok) {
      ctx.status = response.status
      ctx.body = { error: (await getStatus(response.status, language)).message }
      await report(response.status, 'Proxy', url)
      return
    }

    ctx.body = await response.json()
    ctx.status = 200
  } catch (error) {
    // TimeoutError: connected, no answer in time. Anything else: no usable answer at all
    ctx.status = error?.name === 'TimeoutError' ? 504 : 502
    ctx.body = { error: (await getStatus(ctx.status, language)).message }
    await report(ctx.status, 'Proxy', error)
  }
})

const server = app.listen(port, () => report(200, 'Listen', `http://127.0.0.1:${port}`))

server.on('error', async (error) => {
  // EADDRINUSE: another process already owns the port
  await report(error.code === 'EADDRINUSE' ? 409 : 500, 'Listen', error)
  process.exit(1)
})
