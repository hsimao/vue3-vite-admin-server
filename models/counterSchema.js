const mongoose = require('mongoose')

// 維護用戶 id 自增長
const counterSchema = mongoose.Schema({
  _id: String,
  sequence_value: Number,
})

module.exports = mongoose.model('counter', counterSchema)
