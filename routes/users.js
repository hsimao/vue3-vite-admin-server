// 用戶管理
const router = require('koa-router')()
const md5 = require('md5')
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const utils = require('../utils')
const { createToken } = require('./../utils/jwt')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  try {
    const { userName, userPassword } = ctx.request.body
    const res = await User.findOne(
      { userName, userPassword: md5(userPassword) },
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

    if (res) {
      const data = {
        ...res._doc,
        token: createToken(res),
      }
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

router.post('/create', async (ctx) => {
  const {
    userName,
    userEmail,
    job,
    mobile,
    state,
    roleList,
    deptId,
  } = ctx.request.body

  // 檢查參數
  if (!userName || !userEmail || !deptId) {
    ctx.body = utils.fail('參數錯誤', utils.CODE.PARAM_ERROR)
    return
  }

  try {
    // 檢查 userName、userEmail 是否已經存在
    const user = await User.findOne(
      { $or: [{ userName }, { userEmail }] },
      '_id userName userEmail'
    )

    if (user) {
      ctx.body = utils.fail('用戶 name 或 email 已存在, 無法新增')
      return
    }

    // 取得累進 userId
    const doc = await Counter.findOneAndUpdate(
      { _id: 'userId' },
      { $inc: { sequence_value: 1 } }, // 累加 1
      { new: true }
    )

    // counter userId 資料表位創建, 初始 coutner userId 資料表
    // 直接返回錯誤, 讓操作人員再重送一次
    if (!doc) {
      await Counter.create({ _id: 'userId', sequence_value: 10001 })
      ctx.body = utils.fail('新增失敗')
      return
    }

    const userData = {
      userId: doc.sequence_value,
      userName,
      userPassword: md5('123456'),
      userEmail,
      job,
      mobile,
      state,
      roleList,
      deptId,
    }

    // 創建新用戶
    const res = await User.create(userData)

    if (res) {
      ctx.body = utils.success({ userId: res.userId }, '新增用戶成功')
      return
    }
    ctx.body = utils.fail('新增用戶失敗')
  } catch (error) {
    ctx.body = utils.fail(`新增用戶失敗: ${error.stack}`)
  }
})

router.post('/edit', async (ctx) => {
  const { userId, job, mobile, state, roleList, deptId } = ctx.request.body

  if (!userId) {
    ctx.body = utils.fail('參數錯誤', utils.CODE.PARAM_ERROR)
    return
  }
  if (!deptId || !deptId.length) {
    ctx.body = utils.fail('部門不可為空', utils.CODE.PARAM_ERROR)
    return
  }

  try {
    const res = await User.findOneAndUpdate(
      { userId },
      { job, mobile, state, roleList, deptId }
    )

    if (res) {
      ctx.body = utils.success(
        { job, mobile, state, roleList, deptId },
        '更新成功'
      )
      return
    }
    ctx.body = utils.fail('更新失敗')
  } catch (error) {
    ctx.body = utils.fail(`更新失敗: ${error.stack}`)
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
