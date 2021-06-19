// 用戶管理
const router = require('koa-router')()
const User = require('./../models/userSchema')
const utils = require('./../utils/util')
const { createToken } = require('./../utils/jwt')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  try {
    const { userName, userPassword } = ctx.request.body
    const res = await User.findOne(
      { userName, userPassword },
      {
        userId: 1,
        userName: 1,
        state: 1,
        role: 1,
        deptId: 1,
        roleList: 1,
        _id: 0,
      }
    )

    const data = {
      ...res._doc,
      token: createToken(res),
    }

    if (res) {
      ctx.body = utils.success(data)
    } else {
      ctx.body = utils.fail('帳號或密碼錯誤！')
    }
  } catch (error) {
    ctx.body = utils.fail(error.msg)
  }
})

module.exports = router
