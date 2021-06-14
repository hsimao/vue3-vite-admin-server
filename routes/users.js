// 用戶管理
const router = require('koa-router')()
const User = require('./../models/userSchema')
const utils = require('./../utils/util')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  try {
    const { userName, userPassword } = ctx.request.body
    const res = await User.findOne({ userName, userPassword })

    if (res) {
      ctx.body = utils.success(res)
    } else {
      ctx.body = utils.fail('帳號或密碼錯誤！')
    }
  } catch (error) {
    ctx.body = utils.fail(error.msg)
  }
})

module.exports = router
