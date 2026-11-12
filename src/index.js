import Koa from 'koa'
import 'dotenv/config'

const port = Number(process.env.PORT ?? 3000)

const app = new Koa()

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

  if (!url) {
    ctx.status = 500
    ctx.body = { error: 'API_URL is not set' }
    return
  }

  try {
    const res = await fetch(url)
    ctx.body = await res.json()
  } catch (error) {
    console.error(error)
    ctx.status = 502
    ctx.body = { error: 'upstream request failed' }
  }
})

app.listen(port, () => {
  console.log(`listening on http://127.0.0.1:${port}`)
})
