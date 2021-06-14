const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  userId: Number, // 用戶 ID，自增長
  userName: String,
  userPassword: String, // 用戶密碼, md5 加密
  userEmail: String,
  mobile: String,
  sex: Number, // 性別 0:男  1：女
  deptId: [], // 部門
  job: String,
  state: {
    type: Number,
    default: 1, // 狀態 - 1: 在職 2: 離職 3: 適用期
  },
  role: {
    type: Number,
    default: 1, // 用戶角色 - 0: 管理員 1 普通用戶
  },
  roleList: [],
  createTime: {
    type: Date,
    default: Date.now(),
  },
  lastLoginTime: {
    type: Date,
    default: Date.now(),
  },
  remark: String,
})

module.exports = mongoose.model('users', userSchema)
