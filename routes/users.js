// 用戶管理
const router = require('koa-router')()
const User = require('./../models/userSchema')
const utils = require('../utils')
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

// 用戶列表
router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = utils.pager(ctx.request.query)

  const params = {}

  if (userId) params.userId = userId
  if (userName) params.userName = userName
  if (state && state !== '0') params.state = state

  try {
    const query = User.find(params, {
      _id: 0,
    })

    // 分頁, 從 skipIndex 開始查詢
    const list = await query.skip(skipIndex).limit(page.pageSize)
    // 總筆數
    const total = await User.countDocuments(params)

    ctx.body = utils.success({
      page: {
        ...page,
        total,
      },
      list,
    })
  } catch (error) {
    ctx.body = utils.fail(`查詢異常: ${error.stack}`)
  }
})

// 刪除用戶/批量刪除
router.delete('/delete', async (ctx) => {
  const { userIds } = ctx.request.body
  // 只更改用戶狀態 2: 離職, 不刪除用戶資料
  try {
    const res = await User.updateMany(
      { userId: { $in: userIds } },
      { state: 2 }
    )

    if (res.nModified) {
      ctx.body = utils.success(res, `成功刪除 ${res.nModified} 位用戶`)
      return
    }
    ctx.body = utils.fail('刪除失敗')
  } catch (error) {
    ctx.body = utils.fail(`刪除失敗: ${error.stack}`)
  }
})

module.exports = router
