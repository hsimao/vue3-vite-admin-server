const mongoose = require('mongoose')
const log4js = require('../utils/log4js')

const mongodbConnectUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.as02s.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

mongoose.connect(mongodbConnectUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on('error', (err) => {
  console.log(err)
  log4js.error('mongoDB 連接失敗')
})

db.on('open', () => {
  log4js.info('mongoDB 連接成功')
})
