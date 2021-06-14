const Koa = require('koa')
const app = new Koa()
const dotenv = require('dotenv')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4js')
const router = require('koa-router')()

const users = require('./routes/users')

dotenv.config({ path: `${__dirname}/config/${app.env}.env` })

// error handler
onerror(app)

require('./config/db')

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  })
)

// logger
app.use(async (ctx, next) => {
  if (ctx.request.method === 'GET') {
    log4js.info(`params: ${JSON.stringify(ctx.request.query)}`)
  } else {
    log4js.info(`body: ${JSON.stringify(ctx.request.body)}`)
  }

  await next()
})

// routes
router.prefix('/api')
router.use(users.routes(), users.allowedMethods())
app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(err.stack)
})

module.exports = app
